export interface ExecutionSpan {
  id: string;
  type: string;
  startedAt: number;
  endedAt?: number;
  metadata?: Record<string, unknown>;
}
