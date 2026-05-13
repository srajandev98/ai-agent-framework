import { Model } from "./model";
import { Tool } from "./tool";
import { Message } from "./types";
import { AgentRuntime } from "./runtime";

interface AgentConfig {
  model: Model;
  instructions?: string;
  tools?: Tool[];
}

export class Agent {
  private runtime: AgentRuntime;
  private instructions?: string;

  constructor(private config: AgentConfig) {
    this.runtime = new AgentRuntime(config.model, config.tools || []);
    this.instructions = config.instructions;
  }

  async generate(input: string): Promise<string> {
    const messages: Message[] = [];

    if (this.instructions) {
      messages.push({
        role: "system",
        content: this.instructions,
      });
    }

    messages.push({
      role: "user",
      content: input,
    });

    return this.runtime.run({
      messages,
      steps: 0,
      spans: []
    });
  }
}
