# Core Runtime Contract (v0.1.0-mvp)

This document defines the current expected behavior for `@ai-agent-framework/core`.

## Runnable API

- `Runnable<I, O>` exposes:
  - `invoke(input: I): Promise<O>`
  - `pipe(next): Runnable<I, NextOutput>`
- `RunnableLambda` wraps sync/async functions into runnable units.
- `RunnableSequence` composes runnables in order.
- `RunnableParallel` runs multiple branches with the same input and returns a merged object output.
- `ModelRunnable` adapts `Model.generate(...)` into a `string -> string` runnable path and expects a `final-response` node.

## Prompt API

- `PromptTemplate<{...vars}>` formats string templates with `{variable}` placeholders.
- Missing template variables throw `PromptTemplateError`.

## Output Parser API

- `StringOutputParser`: pass-through parser for raw model text.
- `JsonOutputParser<T>`: parses JSON text into typed output.
- Invalid JSON throws `OutputParserError`.

## Agent API

- `new Agent({ model, tools, passes?, hooks?, maxSteps? })`
- `agent.run(input: string): Promise<string>`

## Runtime loop

1. Runtime creates a `step` span.
2. Runtime sends model input as:
   - a system memory message
   - accumulated state messages
3. Model output nodes are interpreted into runtime instructions.
4. Runtime executes instructions in order:
   - `return` stops and resolves `agent.run(...)`
   - `tool` executes registered tools and appends tool result messages/memory
5. Steps repeat until a final response is returned or `maxSteps` is exceeded.

## Message ordering for tool calls

When model output includes tool calls:

1. Runtime appends an `assistant` message carrying `toolCalls`.
2. Runtime executes the requested tool.
3. Runtime appends the `tool` role message with `toolCallId`.

This ordering is required so provider adapters can continue tool loops correctly.

## Tool execution contract

- Tool lookup is by exact `tool.name`.
- Tool arguments are validated using each tool's Zod schema before execution.
- Tool middleware receives validated arguments.

## Error contract

- Unknown tool name: `ToolNotFoundError`
- Invalid tool arguments: `ToolValidationError`
- Model/provider failure: `ModelError` with `cause`
- Exceeded configured step limit: `MaxStepsExceededError`
- Prompt variable formatting failure: `PromptTemplateError`
- Output parsing failure: `OutputParserError`

## Default limits

- `maxSteps` default is `20` if not explicitly set.
