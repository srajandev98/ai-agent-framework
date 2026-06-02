import { Model } from "../model/model";
import { AgentState } from "../state/state";
import { IRInterpreter } from "../ir/interpreter";
import { InstructionPass } from "../passes";
import { ToolRegistry } from "../tools/tool-registry";
import { ExecutionSpan } from "../tracing/tracing";
import { ModelError, MaxStepsExceededError } from "../errors/errors";
import { Message, LLMResponse } from "../types/types";
import { randomUUID } from "node:crypto";

export interface RetryConfig {
  maxAttempts?: number;
  backoffMs?: number;
}

export interface RuntimePolicy {
  modelTimeoutMs?: number;
  modelRetry?: RetryConfig;
}

export class AgentRuntime {
  private interpreter = new IRInterpreter();

  constructor(
    private model: Model,
    private toolRegistry: ToolRegistry,
    private passes: InstructionPass[] = [],
    private maxSteps: number = 20,
    private policy: RuntimePolicy = {}
  ) {}

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    if (!timeoutMs || timeoutMs <= 0) {
      return operation;
    }

    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([operation, timeoutPromise]);
  }

  private async generateWithPolicy(
    messages: Message[]
  ): Promise<LLMResponse> {
    const maxAttempts = this.policy.modelRetry?.maxAttempts ?? 1;
    const backoffMs = this.policy.modelRetry?.backoffMs ?? 0;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.withTimeout(
          this.model.generate(messages, this.toolRegistry.list()),
          this.policy.modelTimeoutMs
        );
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts && backoffMs > 0) {
          await this.sleep(backoffMs * attempt);
        }
      }
    }

    throw new ModelError("Model generation failed", lastError);
  }

  private formatMemory(state: AgentState): string {
    return state.memory
      .map((m) => `[${m.type}] ${m.content}`)
      .join("\n");
  }

  private async step(
    state: AgentState
  ): Promise<string | null> {

    const stepSpan: ExecutionSpan = {
      id: randomUUID(),
      type: "step",
      startedAt: Date.now(),
      metadata: {
        step: state.steps
      }
    };

    state.spans.push(stepSpan);

    const memoryContext = this.formatMemory(state);

    const response = await this.generateWithPolicy([
      {
        role: "system",
        content: `You have access to memory:\n\n${memoryContext}`
      },
      ...state.messages
    ]);

    let instructions = this.interpreter.interpret(
      response.nodes
    );

    const toolCalls = response.nodes
      .filter((node) => node.type === "tool-call")
      .map((node) => ({
        id: node.id,
        name: node.toolName,
        arguments: node.args
      }));

    if (toolCalls.length > 0) {
      state.messages.push({
        role: "assistant",
        content: "",
        toolCalls
      });
    }

    for (const pass of this.passes) {
      instructions = await pass.run(instructions, state);
    }

    for (const instruction of instructions) {
      switch (instruction.type) {

        case "return": {
          stepSpan.endedAt = Date.now();
          return instruction.content;
        }

        case "tool": {
          const parsedArgs = instruction.args;

          const result = await this.toolRegistry.execute(
            instruction.toolName,
            parsedArgs
          );

          state.messages.push({
            role: "tool",
            content: JSON.stringify(result),
            toolCallId: instruction.callId
          });

          state.memory.push({
            id: randomUUID(),
            type: "tool-result",
            content: JSON.stringify(result),
            createdAt: Date.now()
          });

          break;
        }
      }
    }

    state.steps++;

    stepSpan.endedAt = Date.now();

    return null;
  }

  async run(state: AgentState): Promise<string> {
    while (state.steps < this.maxSteps) {
      const result = await this.step(state);

      if (result) {
        return result;
      }
    }

    throw new MaxStepsExceededError(this.maxSteps);
  }
}
