export class ToolNotFoundError extends Error {
  constructor(toolName: string) {
    super(`Tool not found: ${toolName}`);
    this.name = "ToolNotFoundError";
  }
}

export class ToolValidationError extends Error {
  constructor(toolName: string, cause: unknown) {
    super(`Invalid arguments for tool: ${toolName}`, { cause });
    this.name = "ToolValidationError";
  }
}

export class ModelError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = "ModelError";
  }
}

export class MaxStepsExceededError extends Error {
  constructor(maxSteps: number) {
    super(`Agent exceeded max steps: ${maxSteps}`);
    this.name = "MaxStepsExceededError";
  }
}

export class PromptTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptTemplateError";
  }
}

export class OutputParserError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause ? { cause } : undefined);
    this.name = "OutputParserError";
  }
}
