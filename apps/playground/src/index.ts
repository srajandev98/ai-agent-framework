import "dotenv/config";
import { z } from "zod";
import { Agent, tool } from "@ai-agent-framework/core";
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

  const result = await agent.run("What's the weather in Delhi?");

  console.log(result);
}

main();
