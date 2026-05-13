import { AgentNode } from "../ir/ir";

export type Role = "system" | "user" | "assistant" | "tool";

export interface Message {
  role: Role;
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: unknown;
}

export interface LLMResponse {
  nodes: AgentNode[];
}
