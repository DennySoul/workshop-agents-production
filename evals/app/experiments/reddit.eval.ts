import { runEval } from '../evalTools.ts'
import { runLLM } from '../../../src/llm.ts'
import { redditToolDefinition } from '../../../src/tools/reddit.ts'
import { ToolCallMatch } from '../scorers.ts'

const createToolCallMessage = (toolName: string) => ({
  role: 'assistant',
  tool_calls: [
    {
      type: 'function',
      function: { name: toolName },
    },
  ],
});

await runEval('reddit', {
  task: async (input) => runLLM({
    messages: [{role: 'user', content: input}],
    tools: [redditToolDefinition],
  }),
  data: [
    {
      input: 'tell me something from reddit',
      expected: createToolCallMessage(redditToolDefinition.name),
    }
  ],
  scorers: [ToolCallMatch],
});