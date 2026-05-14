import { Runnable } from "./runnable";
import { RunnableSequence } from "./runnable-sequence";

export type RunnableMapFields<I, TMap extends Record<string, unknown>> = {
  [K in keyof TMap]: Runnable<I, TMap[K]>;
};

export class RunnableMap<
  I,
  TMap extends Record<string, unknown>
> implements Runnable<I, TMap> {
  constructor(private fields: RunnableMapFields<I, TMap>) {}

  async invoke(input: I): Promise<TMap> {
    const entries = Object.entries(this.fields) as Array<
      [keyof TMap, Runnable<I, TMap[keyof TMap]>]
    >;

    const resolvedEntries = await Promise.all(
      entries.map(async ([key, runnable]) => {
        const value = await runnable.invoke(input);
        return [key, value] as const;
      })
    );

    return Object.fromEntries(resolvedEntries) as TMap;
  }

  pipe<NextOutput>(next: Runnable<TMap, NextOutput>): Runnable<I, NextOutput> {
    return new RunnableSequence<I, NextOutput>([this, next]);
  }
}
