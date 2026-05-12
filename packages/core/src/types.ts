export type Role =
  | "system"
  | "user"
  | "assistant"
  | "tool";

export interface Message {
  role: Role;
  content: string;
  toolCallId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface LLMResponse {
  message: Message;
  toolCalls?: ToolCall[];
}