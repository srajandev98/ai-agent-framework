import { Tool } from "./tool";
import { ToolMiddleware } from "./tool-middleware";
import { ToolNotFoundError, ToolValidationError } from "../errors/errors";

export class ToolRegistry {
  private tools = new Map<string, Tool>();
  private middleware: ToolMiddleware[] = [];

  register(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  use(mw: ToolMiddleware) {
    this.middleware.push(mw);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  async execute(toolName: string, args: any) {
    const tool = this.get(toolName);

    if (!tool) {
      throw new ToolNotFoundError(toolName);
    }

    let parsedArgs: unknown;

    try {
      parsedArgs = tool.schema.parse(args);
    } catch (error) {
      throw new ToolValidationError(toolName, error);
    }

    const ctx = { tool, args: parsedArgs };

    // BEFORE hooks
    for (const mw of this.middleware) {
      await mw.before?.(ctx);
    }

    const result = await tool.execute(parsedArgs);

    // AFTER hooks
    for (const mw of this.middleware) {
      await mw.after?.(ctx, result);
    }

    return result;
  }
}
