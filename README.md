# ai-agent-framework

TypeScript framework for building AI chains and agents with composable primitives.

## Current MVP

- Runnables: `RunnableLambda`, `RunnableSequence`, `RunnableParallel`, `ModelRunnable`
- Prompts: `PromptTemplate`
- Output parsers: `StringOutputParser`, `JsonOutputParser`
- Agent runtime with tool calling and memory loop
- OpenAI provider adapter

## Requirements

- Node.js `>=24`
- pnpm `11.x`

## Install

```bash
pnpm install
```

## Quickstart: Runnable Chain

```ts
import {
  RunnableMap,
  RunnableLambda,
  PromptTemplate,
  ModelRunnable,
  JsonOutputParser
} from "@ai-agent-framework/core";
import { openai } from "@ai-agent-framework/openai";

const inputMap = new RunnableMap<{
  topic: string;
}, {
  topic: string;
  tone: string;
}>({
  topic: new RunnableLambda(({ topic }) => topic.trim()),
  tone: new RunnableLambda(() => "concise")
});

const prompt = new PromptTemplate<{
  topic: string;
  tone: string;
}>({
  template:
    "In a {tone} tone, return valid JSON only with keys {\"summary\": string, \"score\": number} about {topic}."
});

const model = new ModelRunnable(
  openai({ model: "gpt-4o-mini" })
);

const parser = new JsonOutputParser<{
  summary: string;
  score: number;
}>();

const chain = inputMap
  .pipe(prompt)
  .pipe(model)
  .pipe(parser);

const result = await chain.invoke({
  topic: "TypeScript"
});

console.log(result.summary);
console.log(result.score);
```

## Quickstart: Agent With Tool

```ts
import { z } from "zod";
import { Agent, tool } from "@ai-agent-framework/core";
import { openai } from "@ai-agent-framework/openai";

const weatherTool = tool({
  name: "weather",
  description: "Get weather for a city",
  schema: z.object({
    city: z.string()
  }),
  async execute({ city }) {
    return {
      city,
      temperature: 32
    };
  }
});

const agent = new Agent({
  model: openai({ model: "gpt-4o-mini" }),
  tools: [weatherTool],
  maxSteps: 10
});

const output = await agent.run("What is the weather in Delhi?");
console.log(output);
```

## Errors

Common framework errors:

- `ModelError`
- `ToolNotFoundError`
- `ToolValidationError`
- `MaxStepsExceededError`
- `PromptTemplateError`
- `OutputParserError`

## Scripts

```bash
pnpm lint
pnpm test --run
pnpm --filter @ai-agent-framework/core build
pnpm --filter @ai-agent-framework/openai build
```

## Notes

Detailed runtime behavior is documented in `CORE_CONTRACT.md`.
