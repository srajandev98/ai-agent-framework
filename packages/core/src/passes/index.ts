import { Instruction } from "../ir/instructions";
import { AgentState } from "../state/state";

export interface InstructionPass {
  run(instructions: Instruction[], state: AgentState): Promise<Instruction[]>;
}
