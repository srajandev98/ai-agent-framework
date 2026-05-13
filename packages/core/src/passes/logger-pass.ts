import { InstructionPass } from ".";
import { Instruction } from "../ir/instructions";
import { AgentState } from "../state/state";

export class LoggerPass implements InstructionPass {
  async run(
    instructions: Instruction[],
    _state: AgentState
  ): Promise<Instruction[]> {
    console.log("Executing instructions:");

    console.log(instructions);

    return instructions;
  }
}
