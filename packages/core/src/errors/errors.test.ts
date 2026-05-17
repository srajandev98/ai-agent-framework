import { describe, expect, it } from "vitest";
import {
  MaxStepsExceededError,
  ModelError,
  OutputParserError,
  PromptTemplateError,
  ToolNotFoundError,
  ToolValidationError
} from "./errors";

describe("framework error codes", () => {
  it("assigns stable codes", () => {
    expect(new ToolNotFoundError("weather").code).toBe("AIFW_TOOL_NOT_FOUND");
    expect(new ToolValidationError("weather", new Error("bad")).code).toBe(
      "AIFW_TOOL_VALIDATION_ERROR"
    );
    expect(new ModelError("provider failed", new Error("boom")).code).toBe("AIFW_MODEL_ERROR");
    expect(new MaxStepsExceededError(2).code).toBe("AIFW_MAX_STEPS_EXCEEDED");
    expect(new PromptTemplateError("missing var").code).toBe("AIFW_PROMPT_TEMPLATE_ERROR");
    expect(new OutputParserError("invalid json").code).toBe("AIFW_OUTPUT_PARSER_ERROR");
  });
});
