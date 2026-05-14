import { Runnable } from "../runnables/runnable";
import { RunnableSequence } from "../runnables/runnable-sequence";
import { PromptTemplateError } from "../errors/errors";

export interface PromptTemplateConfig {
  template: string;
}

export class PromptTemplate<
  TVars extends Record<string, unknown> = Record<string, unknown>
> implements Runnable<TVars, string> {
  constructor(private config: PromptTemplateConfig) {}

  private extractVariables(): string[] {
    const matches = this.config.template.matchAll(/\{(\w+)\}/g);
    return Array.from(matches, (match) => match[1]);
  }

  async invoke(input: TVars): Promise<string> {
    let output = this.config.template;
    const requiredVariables = this.extractVariables();

    for (const variableName of requiredVariables) {
      const value = input[variableName];

      if (value === undefined || value === null) {
        throw new PromptTemplateError(
          `Missing value for template variable: ${variableName}`
        );
      }

      const placeholder = new RegExp(`\\{${variableName}\\}`, "g");
      output = output.replace(placeholder, String(value));
    }

    return output;
  }

  pipe<NextOutput>(next: Runnable<string, NextOutput>): Runnable<TVars, NextOutput> {
    return new RunnableSequence<TVars, NextOutput>([this, next]);
  }
}
