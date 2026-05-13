import { Model } from "./model";
import { Tool } from "./tool";
import { AgentState } from "./state";
import { IRInterpreter } from "./interpreter";
import { InstructionPass } from "./passes";
import { LoggerPass } from "./passes/logger-pass";

export class AgentRuntime {
  private interpreter = new IRInterpreter();

  private passes: InstructionPass[] = [new LoggerPass()];

  constructor(
    private model: Model,
    private tools: Tool[]
  ) {}

  async run(state: AgentState): Promise<string> {
    while (true) {
      const response = await this.model.generate(state.messages, this.tools);

      let instructions = this.interpreter.interpret(response.nodes);

      for (const pass of this.passes) {
        instructions = await pass.run(instructions, state);
      }

      for (const instruction of instructions) {
        switch (instruction.type) {
          case "return": {
            return instruction.content;
          }

          case "tool": {
            const tool = this.tools.find(
              (t) => t.name === instruction.toolName
            );

            if (!tool) {
              throw new Error(`Tool not found: ${instruction.toolName}`);
            }

            const parsedArgs = tool.schema.parse(instruction.args);

            const result = await tool.execute(parsedArgs);

            state.messages.push({
              role: "tool",

              content: JSON.stringify(result),

              toolCallId: instruction.callId,
            });

            break;
          }
        }
      }

      state.steps++;
    }
  }
}
