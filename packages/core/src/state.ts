import { Message } from "./types";

export interface AgentState {
  messages: Message[];
  steps: number;
}
