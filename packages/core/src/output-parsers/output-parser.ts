import { Runnable } from "../runnables/runnable";
import { RunnableSequence } from "../runnables/runnable-sequence";

export type OutputParser<TOutput> = Runnable<string, TOutput>;

export abstract class BaseOutputParser<TOutput>
  implements OutputParser<TOutput> {
  abstract invoke(input: string): Promise<TOutput>;

  pipe<NextOutput>(
    next: Runnable<TOutput, NextOutput>
  ): Runnable<string, NextOutput> {
    return new RunnableSequence<string, NextOutput>([this, next]);
  }
}
