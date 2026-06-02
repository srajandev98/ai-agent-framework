import { AgentRuntime } from "../runtime/runtime";
import { Model } from "../model/model";
import { Tool } from "../tools/tool";
import { ToolRegistry } from "../tools/tool-registry";
import { InstructionPass } from "../passes";
import { AgentState } from "../state/state";
import { AgentHooks } from "./hooks";
import { RuntimePolicy } from "../runtime/runtime";

export interface AgentConfig {
  model: Model;
  tools: Tool[];
  systemPrompt?: string;
  passes?: InstructionPass[];
  hooks?: AgentHooks;
  maxSteps?: number;
  runtimePolicy?: RuntimePolicy;
}

export class Agent {
  private runtime: AgentRuntime;
  private hooks?: AgentHooks;
  private systemPrompt?: string;

  constructor(config: AgentConfig) {
    const {
      model,
      tools,
      systemPrompt,
      passes = [],
      hooks,
      maxSteps = 20,
      runtimePolicy = {}
    } = config;
    const toolRegistry = new ToolRegistry();
    this.hooks = hooks;
    this.systemPrompt = systemPrompt;

    for (const tool of tools) {
      toolRegistry.register(tool);
    }

    this.runtime = new AgentRuntime(
      model,
      toolRegistry,
      passes,
      maxSteps,
      runtimePolicy
    );
  }

  async run(input: string): Promise<string> {
    const messages: AgentState["messages"] = [];

    if (this.systemPrompt !== undefined) {
      messages.push({
        role: "system",
        content: this.systemPrompt
      });
    }

    messages.push({
      role: "user",
      content: input
    });

    const state: AgentState = {
      messages,
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
