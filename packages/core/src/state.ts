import { Message } from "./types";
import { ExecutionSpan } from "./tracing";
import { MemoryItem } from "./memory";

export interface AgentState {
  messages: Message[];
  steps: number;
  spans: ExecutionSpan[];
  memory: MemoryItem[];
}