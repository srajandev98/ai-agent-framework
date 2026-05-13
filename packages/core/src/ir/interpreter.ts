import { AgentNode } from "../ir/ir";
import { Instruction } from "../ir/instructions";

export class IRInterpreter {
  interpret(nodes: AgentNode[]): Instruction[] {
    return nodes.map((node) => {
      switch (node.type) {
        case "tool-call":
          return {
            type: "tool",
            toolName: node.toolName,
            args: node.args,
            callId: node.id,
          };

        case "final-response":
          return {
            type: "return",
            content: node.content,
          };
      }
    });
  }
}
