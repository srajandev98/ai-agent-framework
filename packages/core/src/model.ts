import { Message, LLMResponse } from "./types";
import { Tool } from "./tool";

export interface Model {
  generate(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;
}
