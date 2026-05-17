export type FrameworkErrorCode =
  | "AIFW_TOOL_NOT_FOUND"
  | "AIFW_TOOL_VALIDATION_ERROR"
  | "AIFW_MODEL_ERROR"
  | "AIFW_MAX_STEPS_EXCEEDED"
  | "AIFW_PROMPT_TEMPLATE_ERROR"
  | "AIFW_OUTPUT_PARSER_ERROR";

class FrameworkError extends Error {
  readonly code: FrameworkErrorCode;

  constructor(name: string, code: FrameworkErrorCode, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = name;
    this.code = code;
  }
}

export class ToolNotFoundError extends FrameworkError {
  constructor(toolName: string) {
    super("ToolNotFoundError", "AIFW_TOOL_NOT_FOUND", `Tool not found: ${toolName}`);
  }
}

export class ToolValidationError extends FrameworkError {
  constructor(toolName: string, cause: unknown) {
    super(
      "ToolValidationError",
      "AIFW_TOOL_VALIDATION_ERROR",
      `Invalid arguments for tool: ${toolName}`,
      cause
    );
  }
}

export class ModelError extends FrameworkError {
  constructor(message: string, cause: unknown) {
    super("ModelError", "AIFW_MODEL_ERROR", message, cause);
  }
}

export class MaxStepsExceededError extends FrameworkError {
  constructor(maxSteps: number) {
    super(
      "MaxStepsExceededError",
      "AIFW_MAX_STEPS_EXCEEDED",
      `Agent exceeded max steps: ${maxSteps}`
    );
  }
}

export class PromptTemplateError extends FrameworkError {
  constructor(message: string) {
    super("PromptTemplateError", "AIFW_PROMPT_TEMPLATE_ERROR", message);
  }
}

export class OutputParserError extends FrameworkError {
  constructor(message: string, cause?: unknown) {
    super("OutputParserError", "AIFW_OUTPUT_PARSER_ERROR", message, cause);
  }
}
