import { Runnable } from "./runnable";
import { RunnableSequence } from "./runnable-sequence";

export type RunnableParallelSteps<I, TMap extends Record<string, unknown>> = {
  [K in keyof TMap]: Runnable<I, TMap[K]>;
};

export class RunnableParallel<
  I,
  TMap extends Record<string, unknown>
> implements Runnable<I, TMap> {
  constructor(private steps: RunnableParallelSteps<I, TMap>) {}

  async invoke(input: I): Promise<TMap> {
    const entries = Object.entries(this.steps) as Array<
      [keyof TMap, Runnable<I, TMap[keyof TMap]>]
    >;

    const results = await Promise.all(
      entries.map(async ([key, step]) => {
        const value = await step.invoke(input);
        return [key, value] as const;
      })
    );

    return Object.fromEntries(results) as TMap;
  }

  pipe<NextOutput>(
    next: Runnable<TMap, NextOutput>
  ): Runnable<I, NextOutput> {
    return new RunnableSequence<I, NextOutput>([this, next]);
  }
}
