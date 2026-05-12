import { Message, LLMResponse } from "./types";

export interface Model {
  generate(
    messages: Message[]
  ): Promise<LLMResponse>;
}