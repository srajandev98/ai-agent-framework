import { describe, it, expect } from "vitest";
import { PromptTemplate } from "./prompt-template";
import { RunnableLambda } from "../runnables/runnable-lambda";
import { PromptTemplateError } from "../errors/errors";

describe("PromptTemplate", () => {
  it("formats a prompt string from provided variables", async () => {
    const template = new PromptTemplate<{
      question: string;
      context: string;
    }>({
      template: "Question: {question}\nContext: {context}"
    });

    await expect(
      template.invoke({
        question: "What is TypeScript?",
        context: "A typed superset of JavaScript"
      })
    ).resolves.toBe(
      "Question: What is TypeScript?\nContext: A typed superset of JavaScript"
    );
  });

  it("throws PromptTemplateError when a variable value is missing", async () => {
    const template = new PromptTemplate<{
      question: string;
      context?: string;
    }>({
      template: "Question: {question}\nContext: {context}"
    });

    await expect(
      template.invoke({
        question: "What is TypeScript?"
      })
    ).rejects.toBeInstanceOf(PromptTemplateError);
  });

  it("composes with runnables through pipe()", async () => {
    const template = new PromptTemplate<{
      topic: string;
    }>({
      template: "Explain {topic} in one line."
    });

    const addPrefix = new RunnableLambda<string, string>(
      (prompt) => `[PROMPT]\n${prompt}`
    );

    const chain = template.pipe(addPrefix);

    await expect(chain.invoke({ topic: "agents" })).resolves.toBe(
      "[PROMPT]\nExplain agents in one line."
    );
  });
});
