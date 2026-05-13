import OpenAI from "openai";
import type {
  Model,
  Message,
  LLMResponse,
  Tool
} from "@ai-agent-framework/core";
import { zodToJsonSchema } from "zod-to-json-schema";


export function openai(
  modelName: string
): Model {

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  return {
    async generate(
      messages: Message[],
      tools?: Tool[]
    ): Promise<LLMResponse> {

      const response =
        await client.chat.completions.create({
          model: modelName,

          messages: messages.map((m) => {
            switch (m.role) {
              case "system":
                return {
                  role: "system" as const,
                  content: m.content
                };

              case "user":
                return {
                  role: "user" as const,
                  content: m.content
                };

              case "assistant":
                return {
                  role: "assistant" as const,
                  content: m.content
                };

              case "tool":
                return {
                  role: "tool" as const,
                  content: m.content,
                  tool_call_id: m.toolCallId!
                };

              default:
                throw new Error(
                  `Unsupported role: ${m.role}`
                );
            }
          }),

          tools: tools?.map((tool) => ({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              parameters: zodToJsonSchema(
                tool.schema as any
              )
            }
          })),
        });

      const message =
        response.choices[0].message;

      return {
        message: {
          role: "assistant",
          content: message.content || ""
        },

        toolCalls: message.tool_calls
          ?.filter(
            (call) => call.type === "function"
          )
          .map((call) => ({
            id: call.id,
            name: call.function.name,
            arguments: JSON.parse(
              call.function.arguments
            )
          }))
      };
    }
  };
}