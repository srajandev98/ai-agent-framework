export interface Runnable<I = unknown, O = unknown> {
  invoke(input: I): Promise<O>;
  pipe<NextOutput>(next: Runnable<O, NextOutput>): Runnable<I, NextOutput>;
}
