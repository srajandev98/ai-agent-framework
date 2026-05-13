import { Message } from "./types";
import { ExecutionSpan } from "./tracing";

export interface AgentState {
  messages: Message[];
  steps: number;
  spans: ExecutionSpan[];
}