import { Message, LLMResponse } from "../types/types";
import { Tool } from "../tools/tool";

export interface Model {
  generate(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;
}
