import { Tool } from "./tool";

export type ToolMiddlewareContext = {
  tool: Tool;
  args: any;
};

export type ToolMiddleware = {
  before?: (ctx: ToolMiddlewareContext) => Promise<void>;
  after?: (ctx: ToolMiddlewareContext, result: any) => Promise<void>;
};