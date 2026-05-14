import { Model } from "../model/model";
import { ModelError } from "../errors/errors";
import { Runnable } from "./runnable";
import { RunnableSequence } from "./runnable-sequence";

export class ModelRunnable implements Runnable<string, string> {
  constructor(private model: Model) {}

  async invoke(input: string): Promise<string> {
    const response = await this.model.generate([
      {
        role: "user",
        content: input
      }
    ]);

    const finalNode = response.nodes.find(
      (node) => node.type === "final-response"
    );

    if (!finalNode) {
      throw new ModelError(
        "ModelRunnable expected a final response node but received tool-call nodes",
        undefined
      );
    }

    return finalNode.content;
  }

  pipe<NextOutput>(
    next: Runnable<string, NextOutput>
  ): Runnable<string, NextOutput> {
    return new RunnableSequence<string, NextOutput>([this, next]);
  }
}
