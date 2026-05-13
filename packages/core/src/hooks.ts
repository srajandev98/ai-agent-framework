import { Message } from "./types";
import { Tool } from "./tool";

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