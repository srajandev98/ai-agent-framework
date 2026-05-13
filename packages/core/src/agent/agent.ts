import { AgentRuntime } from "../runtime/runtime";
import { Model } from "../model/model";
import { Tool } from "../tools/tool";
import { ToolRegistry } from "../tools/tool-registry";
import { InstructionPass } from "../passes";
import { AgentState } from "../state/state";
import { AgentHooks } from "./hooks";

export interface AgentConfig {
  model: Model;
  tools: Tool[];
  passes?: InstructionPass[];
  hooks?: AgentHooks;
  maxSteps?: number;
}

export class Agent {
  private runtime: AgentRuntime;
  private hooks?: AgentHooks;

  constructor(config: AgentConfig) {
    const { model, tools, passes = [], hooks, maxSteps = 20 } = config;
    const toolRegistry = new ToolRegistry();
    this.hooks = hooks;

    for (const tool of tools) {
      toolRegistry.register(tool);
    }

    this.runtime = new AgentRuntime(
      model,
      toolRegistry,
      passes,
      maxSteps
    );
  }

  async run(input: string): Promise<string> {
    const state: AgentState = {
      messages: [
        {
          role: "user",
          content: input
        }
      ],
      steps: 0,
      spans: [],
      memory: []
    };

    this.hooks?.onStart?.(state);

    const result = await this.runtime.run(state);

    this.hooks?.onEnd?.(state, result);

    return result;
  }
}
