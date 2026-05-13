export type AgentNode = FinalResponseNode | ToolCallNode;

export interface FinalResponseNode {
  type: "final-response";
  content: string;
}

export interface ToolCallNode {
  type: "tool-call";
  id: string;
  toolName: string;
  args: unknown;
}
