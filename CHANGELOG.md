# Changelog

## v0.1.0-mvp

Initial MVP release focused on composable chains and a stable agent core.

### Added

- Runnable primitives:
  - `Runnable`
  - `RunnableLambda`
  - `RunnableSequence`
  - `RunnableParallel`
  - `RunnablePassthrough`
  - `RunnableMap`
  - `ModelRunnable`
- Prompt primitive:
  - `PromptTemplate`
- Output parsers:
  - `StringOutputParser`
  - `JsonOutputParser`
- Workflow primitive:
  - `Workflow` with sequential steps, conditional execution, snapshots, and resume state.
- Runtime contract tests for:
  - return flow
  - tool-call ordering
  - unknown tool handling
  - tool arg validation
  - max-steps handling
  - model error wrapping
- Runnable tests:
  - invoke
  - composition
  - parallel execution
  - error propagation
- Prompt/parser tests:
  - formatting
  - parse success/failure
  - runnable composition
  - model runnable final-response expectations

### Changed

- Agent API stabilized as:
  - `new Agent({ model, tools, passes?, hooks?, maxSteps? })`
  - `agent.run(input)`
- Tool execution now validates args through Zod schema before execution.
- Model/provider failures are wrapped as `ModelError`.
- Runtime enforces `maxSteps`.
- Prompt and parser errors are centralized in shared errors:
  - `PromptTemplateError`
  - `OutputParserError`

### Docs

- Added `README.md` with runnable and agent quickstarts.
- Expanded `CORE_CONTRACT.md` to document runnable, prompt, parser, and agent contracts.
- Updated runnable quickstart to show richer chain composition:
  - `RunnableMap -> PromptTemplate -> ModelRunnable -> JsonOutputParser`
