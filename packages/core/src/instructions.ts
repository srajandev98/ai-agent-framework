export type Instruction = ToolInstruction | ReturnInstruction;

export interface ToolInstruction {
  type: "tool";
  toolName: string;
  args: unknown;
  callId: string;
}

export interface ReturnInstruction {
  type: "return";
  content: string;
}
