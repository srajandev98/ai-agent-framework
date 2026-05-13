import { Model } from "./model";
import { Tool } from "./tool";
import { AgentState } from "./state";
import { IRInterpreter } from "./interpreter";
import { InstructionPass } from "./passes";
import { ExecutionSpan } from "./tracing";

export class AgentRuntime {
  private interpreter = new IRInterpreter();

  constructor(
    private model: Model,
    private tools: Tool[],
    private passes: InstructionPass[] = []
  ) { }

  private async step(state: AgentState): Promise<string | null> {
    const stepSpan: ExecutionSpan = {
      id: crypto.randomUUID(),
      type: "step",
      startedAt: Date.now(),
      metadata: {
        step: state.steps
      }
    };

    state.spans.push(stepSpan);

    const response = await this.model.generate(
      state.messages,
      this.tools
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
          const tool = this.tools.find(
            (t) => t.name === instruction.toolName
          );

          if (!tool) {
            throw new Error(
              `Tool not found: ${instruction.toolName}`
            );
          }

          const parsedArgs = tool.schema.parse(
            instruction.args
          );

          const result = await tool.execute(parsedArgs);

          state.messages.push({
            role: "tool",
            content: JSON.stringify(result),
            toolCallId: instruction.callId
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