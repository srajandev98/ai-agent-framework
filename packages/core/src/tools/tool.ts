import { z } from "zod";

export interface Tool<TSchema extends z.ZodSchema = z.ZodSchema> {
  name: string;
  description: string;
  schema: TSchema;

  execute(args: z.infer<TSchema>): Promise<any>;
}

export function tool<TSchema extends z.ZodSchema>(config: Tool<TSchema>) {
  return config;
}
