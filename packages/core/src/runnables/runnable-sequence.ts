import { Runnable } from "./runnable";

export class RunnableSequence<I, O> implements Runnable<I, O> {
  constructor(private steps: Runnable<any, any>[]) {}

  async invoke(input: I): Promise<O> {
    let current: unknown = input;

    for (const step of this.steps) {
      current = await step.invoke(current);
    }

    return current as O;
  }

  pipe<NextOutput>(next: Runnable<O, NextOutput>): Runnable<I, NextOutput> {
    return new RunnableSequence<I, NextOutput>([
      ...this.steps,
      next
    ]);
  }
}
