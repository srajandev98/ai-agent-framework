import { describe, it, expect } from "vitest";
import { RunnableLambda } from "./runnable-lambda";
import { RunnableParallel } from "./runnable-parallel";

describe("Runnable", () => {
  it("invokes a runnable lambda", async () => {
    const addOne = new RunnableLambda<number, number>(
      (value) => value + 1
    );

    await expect(addOne.invoke(4)).resolves.toBe(5);
  });

  it("composes runnables via pipe()", async () => {
    const addTwo = new RunnableLambda<number, number>(
      (value) => value + 2
    );

    const toString = new RunnableLambda<number, string>(
      (value) => `result:${value}`
    );

    const chain = addTwo.pipe(toString);

    await expect(chain.invoke(3)).resolves.toBe("result:5");
  });

  it("supports multiple chained steps", async () => {
    const start = new RunnableLambda<number, number>(
      (value) => value + 1
    );

    const double = new RunnableLambda<number, number>(
      (value) => value * 2
    );

    const format = new RunnableLambda<number, string>(
      (value) => `value=${value}`
    );

    const chain = start
      .pipe(double)
      .pipe(format);

    await expect(chain.invoke(4)).resolves.toBe("value=10");
  });

  it("propagates errors from any step", async () => {
    const start = new RunnableLambda<number, number>(
      (value) => value + 1
    );

    const boom = new RunnableLambda<number, number>(() => {
      throw new Error("step failed");
    });

    const chain = start.pipe(boom);

    await expect(chain.invoke(1)).rejects.toThrow("step failed");
  });

  it("runs parallel branches and returns object output", async () => {
    const parallel = new RunnableParallel<number, {
      doubled: number;
      asText: string;
    }>({
      doubled: new RunnableLambda<number, number>((value) => value * 2),
      asText: new RunnableLambda<number, string>((value) => `n=${value}`)
    });

    await expect(parallel.invoke(5)).resolves.toEqual({
      doubled: 10,
      asText: "n=5"
    });
  });

  it("propagates errors from parallel branches", async () => {
    const parallel = new RunnableParallel<number, {
      ok: number;
      fail: string;
    }>({
      ok: new RunnableLambda<number, number>((value) => value + 1),
      fail: new RunnableLambda<number, string>(() => {
        throw new Error("parallel branch failed");
      })
    });

    await expect(parallel.invoke(1)).rejects.toThrow(
      "parallel branch failed"
    );
  });
});
