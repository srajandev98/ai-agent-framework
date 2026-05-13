import "dotenv/config";
import { z } from "zod";
import {
  Agent,
  ModelError,
  ToolValidationError,
  ToolNotFoundError,
  MaxStepsExceededError,
  tool
} from "@ai-agent-framework/core";
import { openai } from "@ai-agent-framework/openai";

const weatherTool = tool({
  name: "weather",

  description: "Get weather for a city",

  schema: z.object({
    city: z.string(),
  }),

  async execute({ city }) {
    console.log("TOOL EXECUTED:", city);

    return {
      temperature: 32,
      condition: "Sunny",
      city,
    };
  },
});

async function main() {
  const agent = new Agent({
    model: openai({ model: "gpt-4o-mini" }),
    tools: [weatherTool],
    maxSteps: 10,
  });

  try {
    const result = await agent.run("What's the weather in Delhi?");
    console.log(result);
  } catch (error) {
    if (error instanceof ToolNotFoundError) {
      console.error("Tool lookup failed:", error.message);
      return;
    }

    if (error instanceof ToolValidationError) {
      console.error("Tool arguments failed validation:", error.message);
      return;
    }

    if (error instanceof MaxStepsExceededError) {
      console.error("Agent stopped due to max steps:", error.message);
      return;
    }

    if (error instanceof ModelError) {
      console.error("Model request failed:", error.message);
      return;
    }

    throw error;
  }
}

main();
