import { Runnable } from "./runnable";
import { RunnableSequence } from "./runnable-sequence";

export type RunnableHandler<I, O> = (input: I) => Promise<O> | O;

export class RunnableLambda<I, O> implements Runnable<I, O> {
  constructor(private handler: RunnableHandler<I, O>) {}

  async invoke(input: I): Promise<O> {
    return this.handler(input);
  }

  pipe<NextOutput>(next: Runnable<O, NextOutput>): Runnable<I, NextOutput> {
    return new RunnableSequence<I, NextOutput>([this, next]);
  }
}
