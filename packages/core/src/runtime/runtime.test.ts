import { describe, it, expect } from "vitest";
import { z } from "zod";
import { Agent } from "../agent/agent";
import { tool } from "../tools/tool";
import { Model } from "../model/model";
import {
  MaxStepsExceededError,
  ModelError,
  ToolNotFoundError,
  ToolValidationError
} from "../errors/errors";
import { Message, LLMResponse } from "../types/types";

function scriptedModel(
  steps: Array<(messages: Message[]) => LLMResponse>
): Model {
  let callIndex = 0;

  return {
    async generate(messages: Message[]): Promise<LLMResponse> {
      const step = steps[callIndex];

      if (!step) {
        throw new Error(`No scripted response for call ${callIndex}`);
      }

      callIndex++;
      return step(messages);
    }
  };
}

describe("Agent runtime contract", () => {
  it("returns final response when model emits final-response node", async () => {
    const model = scriptedModel([
      () => ({
        nodes: [
          {
            type: "final-response",
            content: "hello from model"
          }
        ]
      })
    ]);

    const agent = new Agent({
      model,
      tools: []
    });

    await expect(agent.run("hi")).resolves.toBe("hello from model");
  });

  it("executes a tool call and appends assistant tool-call message before tool result", async () => {
    const weather = tool({
      name: "weather",
      description: "Get weather",
      schema: z.object({
        city: z.string()
      }),
      async execute({ city }) {
        return { city, temperature: 32 };
      }
    });

    const model = scriptedModel([
      () => ({
        nodes: [
          {
            type: "tool-call",
            id: "call-1",
            toolName: "weather",
            args: { city: "Delhi" }
          }
        ]
      }),
      (messages) => {
        const assistantIndex = messages.findIndex(
          (m) => m.role === "assistant" && m.toolCalls?.[0]?.id === "call-1"
        );
        const toolIndex = messages.findIndex(
          (m) => m.role === "tool" && m.toolCallId === "call-1"
        );

        expect(assistantIndex).toBeGreaterThan(-1);
        expect(toolIndex).toBeGreaterThan(-1);
        expect(assistantIndex).toBeLessThan(toolIndex);

        return {
          nodes: [
            {
              type: "final-response",
              content: "done"
            }
          ]
        };
      }
    ]);

    const agent = new Agent({
      model,
      tools: [weather]
    });

    await expect(agent.run("weather please")).resolves.toBe("done");
  });

  it("throws ToolNotFoundError for a model-requested tool that is not registered", async () => {
    const model = scriptedModel([
      () => ({
        nodes: [
          {
            type: "tool-call",
            id: "missing-1",
            toolName: "not-registered",
            args: {}
          }
        ]
      })
    ]);

    const agent = new Agent({
      model,
      tools: []
    });

    await expect(agent.run("run missing tool")).rejects.toBeInstanceOf(
      ToolNotFoundError
    );
  });

  it("throws ToolValidationError when model passes invalid tool args", async () => {
    const weather = tool({
      name: "weather",
      description: "Get weather",
      schema: z.object({
        city: z.string()
      }),
      async execute({ city }) {
        return { city };
      }
    });

    const model = scriptedModel([
      () => ({
        nodes: [
          {
            type: "tool-call",
            id: "invalid-1",
            toolName: "weather",
            args: { city: 123 }
          }
        ]
      })
    ]);

    const agent = new Agent({
      model,
      tools: [weather]
    });

    await expect(agent.run("invalid args")).rejects.toBeInstanceOf(
      ToolValidationError
    );
  });

  it("throws MaxStepsExceededError when no final response is produced", async () => {
    const model = scriptedModel([
      () => ({ nodes: [] }),
      () => ({ nodes: [] })
    ]);

    const agent = new Agent({
      model,
      tools: [],
      maxSteps: 2
    });

    await expect(agent.run("loop")).rejects.toBeInstanceOf(MaxStepsExceededError);
  });

  it("wraps model failures in ModelError with original cause", async () => {
    const rootCause = new Error("provider unavailable");

    const model: Model = {
      async generate() {
        throw rootCause;
      }
    };

    const agent = new Agent({
      model,
      tools: []
    });

    try {
      await agent.run("hi");
      throw new Error("Expected agent.run to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ModelError);
      expect((error as ModelError).cause).toBe(rootCause);
    }
  });
});
