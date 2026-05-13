import { InstructionPass } from "../passes";
import { Instruction } from "../instructions";
import { AgentState } from "../state";

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
