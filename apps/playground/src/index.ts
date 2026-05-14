import "dotenv/config";
import {
  RunnableMap,
  RunnableLambda,
  PromptTemplate,
  ModelRunnable,
  JsonOutputParser,
  ModelError,
  OutputParserError
} from "@ai-agent-framework/core";
import { openai } from "@ai-agent-framework/openai";

async function main() {
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

  try {
    const result = await chain.invoke({
      topic: "TypeScript"
    });

    console.log(result);
  } catch (error) {
    if (error instanceof ModelError) {
      console.error("Model request failed:", error.message);
      return;
    }

    if (error instanceof OutputParserError) {
      console.error("Model output parse failed:", error.message);
      return;
    }

    throw error;
  }
}

main();
