import { OutputParserError } from "../errors/errors";
import { BaseOutputParser } from "./output-parser";

export class JsonOutputParser<TOutput = unknown>
  extends BaseOutputParser<TOutput> {
  async invoke(input: string): Promise<TOutput> {
    try {
      return JSON.parse(input) as TOutput;
    } catch (error) {
      throw new OutputParserError("Failed to parse JSON output", error);
    }
  }
}
