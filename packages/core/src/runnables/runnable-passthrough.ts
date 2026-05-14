import { Runnable } from "./runnable";
import { RunnableSequence } from "./runnable-sequence";

export class RunnablePassthrough<TInput>
  implements Runnable<TInput, TInput> {
  async invoke(input: TInput): Promise<TInput> {
    return input;
  }

  pipe<NextOutput>(
    next: Runnable<TInput, NextOutput>
  ): Runnable<TInput, NextOutput> {
    return new RunnableSequence<TInput, NextOutput>([this, next]);
  }
}
