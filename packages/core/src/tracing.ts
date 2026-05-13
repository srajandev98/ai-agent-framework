export interface ExecutionSpan {
  id: string;
  type: "tool" | "step";
  startedAt: number;
  endedAt?: number;
  metadata?: Record<string, unknown>;
}
