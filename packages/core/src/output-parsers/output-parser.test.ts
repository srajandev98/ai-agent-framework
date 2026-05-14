import { describe, it, expect } from "vitest";
import { StringOutputParser } from "./string-output-parser";
import { JsonOutputParser } from "./json-output-parser";
import { OutputParserError } from "../errors/errors";
import { RunnableLambda } from "../runnables/runnable-lambda";

describe("OutputParser", () => {
  it("returns raw string with StringOutputParser", async () => {
    const parser = new StringOutputParser();

    await expect(parser.invoke("hello")).resolves.toBe("hello");
  });

  it("parses valid JSON with JsonOutputParser", async () => {
    const parser = new JsonOutputParser<{ score: number }>();

    await expect(parser.invoke("{\"score\":42}")).resolves.toEqual({
      score: 42
    });
  });

  it("throws OutputParserError on invalid JSON", async () => {
    const parser = new JsonOutputParser();

    await expect(parser.invoke("{invalid-json}")).rejects.toBeInstanceOf(
      OutputParserError
    );
  });

  it("composes parser with downstream runnable through pipe()", async () => {
    const parser = new JsonOutputParser<{ score: number }>();

    const toLabel = new RunnableLambda<{ score: number }, string>(
      (value) => `score=${value.score}`
    );

    const chain = parser.pipe(toLabel);

    await expect(chain.invoke("{\"score\":7}")).resolves.toBe("score=7");
  });
});
