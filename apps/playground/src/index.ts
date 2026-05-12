import "dotenv/config";
import { Agent } from "@ai-agent-framework/core";
import { openai } from "@ai-agent-framework/openai";

async function main() {
  const agent = new Agent({
    model: openai("gpt-4.1"),
    instructions:
      "You are a helpful assistant."
  });

  const result =
    await agent.generate(
      "Explain recursion simply."
    );

  console.log(result);
}

main();