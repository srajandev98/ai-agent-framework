import { Instruction } from "./instructions";
import { AgentState } from "./state";

export interface InstructionPass {
  run(instructions: Instruction[], state: AgentState): Promise<Instruction[]>;
}
