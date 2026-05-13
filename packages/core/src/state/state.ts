import { Message } from "../types/types";
import { ExecutionSpan } from "../tracing/tracing";
import { MemoryItem } from "../memory/memory";

export interface AgentState {
  messages: Message[];
  steps: number;
  spans: ExecutionSpan[];
  memory: MemoryItem[];
}