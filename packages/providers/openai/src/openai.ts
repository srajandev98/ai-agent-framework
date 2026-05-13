import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import type {
  Model,
  Message,
  LLMResponse,
  Tool,
} from "@ai-agent-framework/core";

interface OpenAIConfig {
  model: string;
  apiKey?: string;
  baseURL?: string;
}

export function openai(config: OpenAIConfig): Model {
  const client = new OpenAI({
    apiKey: config.apiKey || process.env.OPENAI_API_KEY,

    baseURL: config.baseURL,
  });

  return {
    async generate(messages: Message[], tools?: Tool[]): Promise<LLMResponse> {
      const response = await client.chat.completions.create({
        model: config.model,
        messages: messages.map((m) => {
          switch (m.role) {
            case "system":
              return {
                role: "system" as const,
                content: m.content,
              };

            case "user":
              return {
                role: "user" as const,
                content: m.content,
              };

            case "assistant":
              return {
                role: "assistant" as const,
                content: m.content,
              };

            case "tool":
              return {
                role: "tool" as const,
                content: m.content,
                tool_call_id: m.toolCallId!,
              };

            default:
              throw new Error(`Unsupported role: ${m.role}`);
          }
        }),

        tools: tools?.map((tool) => ({
          type: "function",

          function: {
            name: tool.name,

            description: tool.description,

            parameters: zodToJsonSchema(tool.schema as any),
          },
        })),
      });

      const message = response.choices[0].message;

      const nodes = [];

      if (message.tool_calls?.length) {
        nodes.push(
          ...message.tool_calls
            .filter((call) => call.type === "function")
            .map((call) => ({
              type: "tool-call" as const,

              id: call.id,

              toolName: call.function.name,

              args: JSON.parse(call.function.arguments),
            }))
        );
      } else {
        nodes.push({
          type: "final-response" as const,

          content: message.content || "",
        });
      }

      return { nodes };
    },
  };
}
