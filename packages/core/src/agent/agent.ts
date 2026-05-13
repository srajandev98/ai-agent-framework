import { AgentRuntime } from "../runtime/runtime";
import { Model } from "../model/model";
import { Tool } from "../tools/tool";
import { ToolRegistry } from "../tools/tool-registry";
import { InstructionPass } from "../passes";
import { AgentState } from "../state/state";
import { AgentHooks } from "./hooks";

export class Agent {
  private runtime: AgentRuntime;

  constructor(
    model: Model,
    tools: Tool[],
    passes: InstructionPass[] = [],
    private hooks?: AgentHooks
  ) {
    const toolRegistry = new ToolRegistry();

    for (const tool of tools) {
      toolRegistry.register(tool);
    }

    this.runtime = new AgentRuntime(
      model,
      toolRegistry,
      passes
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