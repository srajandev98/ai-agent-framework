import { Message } from "./types";
import { Model } from "./model";
import { Tool } from "./tool";

interface AgentConfig {
  model: Model;
  instructions?: string;
  tools?: Tool[];
}

export class Agent {
  private model: Model;
  private tools: Tool[];
  private instructions?: string;

  constructor(config: AgentConfig) {
    this.model = config.model;
    this.tools = config.tools || [];
    this.instructions = config.instructions;
  }

  async generate(input: string) {
    const messages: Message[] = [];

    if (this.instructions) {
      messages.push({
        role: "system",
        content: this.instructions
      });
    }

    messages.push({
      role: "user",
      content: input
    });

    return this.run(messages);
  }

  private async run(messages: Message[]) {
    while (true) {
      const response =
        await this.model.generate(messages);

      messages.push(response.message);

      if (!response.toolCalls?.length) {
        return response.message.content;
      }

      for (const call of response.toolCalls) {
        const tool = this.tools.find(
          t => t.name === call.name
        );

        if (!tool) {
          throw new Error(
            `Tool not found: ${call.name}`
          );
        }

        const result = await tool.execute(
          call.arguments
        );

        messages.push({
          role: "tool",
          content: JSON.stringify(result),
          toolCallId: call.id
        });
      }
    }
  }
}