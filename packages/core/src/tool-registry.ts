import { Tool } from "./tool";
import { ToolMiddleware } from "./tool-middleware";

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
      throw new Error(`Tool not found: ${toolName}`);
    }

    const ctx = { tool, args };

    // BEFORE hooks
    for (const mw of this.middleware) {
      await mw.before?.(ctx);
    }

    const result = await tool.execute(args);

    // AFTER hooks
    for (const mw of this.middleware) {
      await mw.after?.(ctx, result);
    }

    return result;
  }
}