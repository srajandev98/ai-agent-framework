import { BaseOutputParser } from "./output-parser";

export class StringOutputParser extends BaseOutputParser<string> {
  async invoke(input: string): Promise<string> {
    return input;
  }
}
