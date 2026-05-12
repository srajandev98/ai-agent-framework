import OpenAI from "openai";

import type {
  Model,
  Message,
  LLMResponse
} from "@ai-agent-framework/core";

export function openai(modelName: string): Model {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  return {
    async generate(
      messages: Message[]
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
          })
        });

      const message =
        response.choices[0].message;

      return {
        message: {
          role: "assistant",
          content: message.content || ""
        }
      };
    }
  };
}