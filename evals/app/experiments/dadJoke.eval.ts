import { runEval } from '../evalTools.ts'
import { runLLM } from '../../../src/llm.ts'
import { dadJokeToolDefinition } from '../../../src/tools/dadJoke.ts'
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

await runEval('dadJoke', {
  task: async input => runLLM({
    messages: [{ role: 'user', content: input}],
    tools: [dadJokeToolDefinition],
  }),
  data: [{
    input: 'tell me a dad joke',
    expected: createToolCallMessage(dadJokeToolDefinition.name),
  }],
  scorers: [ToolCallMatch],
});