import { Message } from "../types/types";
import { Tool } from "../tools/tool";
import { AgentState } from "../state/state";

export interface RuntimeHooks {

  beforeGenerate?(
    messages: Message[]
  ): Promise<void>;

  afterGenerate?(
    response: unknown
  ): Promise<void>;

  beforeTool?(
    tool: Tool,
    args: unknown
  ): Promise<void>;

  afterTool?(
    tool: Tool,
    result: unknown
  ): Promise<void>;
}

export type AgentHooks = {
  onStart?: (state: AgentState) => void;
  onEnd?: (state: AgentState, result: string) => void;

  onStepStart?: (step: number) => void;
  onStepEnd?: (step: number) => void;

  onToolStart?: (tool: string, args: any) => void;
  onToolEnd?: (tool: string, result: any) => void;
};