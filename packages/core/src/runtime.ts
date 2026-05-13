import { Model } from "./model";
import { AgentState } from "./state";
import { IRInterpreter } from "./interpreter";
import { InstructionPass } from "./passes";
import { ToolRegistry } from "./tool-registry";
import { ExecutionSpan } from "./tracing";

export class AgentRuntime {
  private interpreter = new IRInterpreter();

  constructor(
    private model: Model,
    private toolRegistry: ToolRegistry,
    private passes: InstructionPass[] = []
  ) {}

  private formatMemory(state: AgentState): string {
    return state.memory
      .map((m) => `[${m.type}] ${m.content}`)
      .join("\n");
  }

  private async step(
    state: AgentState
  ): Promise<string | null> {

    const stepSpan: ExecutionSpan = {
      id: crypto.randomUUID(),
      type: "step",
      startedAt: Date.now(),
      metadata: {
        step: state.steps
      }
    };

    state.spans.push(stepSpan);

    const memoryContext = this.formatMemory(state);

    const response = await this.model.generate(
      [
        {
          role: "system",
          content: `You have access to memory:\n\n${memoryContext}`
        },
        ...state.messages
      ],
      this.toolRegistry.list()
    );

    let instructions = this.interpreter.interpret(
      response.nodes
    );

    for (const pass of this.passes) {
      instructions = await pass.run(instructions, state);
    }

    for (const instruction of instructions) {
      switch (instruction.type) {

        case "return": {
          stepSpan.endedAt = Date.now();
          return instruction.content;
        }

        case "tool": {
          const parsedArgs = instruction.args;

          const result = await this.toolRegistry.execute(
            instruction.toolName,
            parsedArgs
          );

          state.messages.push({
            role: "tool",
            content: JSON.stringify(result),
            toolCallId: instruction.callId
          });

          state.memory.push({
            id: crypto.randomUUID(),
            type: "tool-result",
            content: JSON.stringify(result),
            createdAt: Date.now()
          });

          break;
        }
      }
    }

    state.steps++;

    stepSpan.endedAt = Date.now();

    return null;
  }

  async run(state: AgentState): Promise<string> {
    while (true) {
      const result = await this.step(state);

      if (result) {
        return result;
      }
    }
  }
}