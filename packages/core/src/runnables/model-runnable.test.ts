import { describe, it, expect } from "vitest";
import { ModelRunnable } from "./model-runnable";
import { Model } from "../model/model";
import { ModelError } from "../errors/errors";

describe("ModelRunnable", () => {
  it("returns text content from final-response node", async () => {
    const model: Model = {
      async generate() {
        return {
          nodes: [
            {
              type: "final-response",
              content: "hello world"
            }
          ]
        };
      }
    };

    const runnable = new ModelRunnable(model);

    await expect(runnable.invoke("say hi")).resolves.toBe("hello world");
  });

  it("throws ModelError when model returns only tool-call nodes", async () => {
    const model: Model = {
      async generate() {
        return {
          nodes: [
            {
              type: "tool-call",
              id: "call-1",
              toolName: "weather",
              args: { city: "Delhi" }
            }
          ]
        };
      }
    };

    const runnable = new ModelRunnable(model);

    await expect(runnable.invoke("use tool")).rejects.toBeInstanceOf(ModelError);
  });
});
