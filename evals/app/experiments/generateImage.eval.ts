import { runEval } from '../evalTools.ts'
import { runLLM } from '../../../src/llm.ts'
import { generateImageToolDefinition } from '../../../src/tools/generateImage.ts'
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

await runEval('generateImage', {
  task: async (input) => runLLM({
    messages: [{role: 'user', content: input}],
    tools: [generateImageToolDefinition],
  }),
  data: [
    {
      input: 'generate image of a sunset',
      expected: createToolCallMessage(generateImageToolDefinition.name),
    },
    {
      input: 'draw mountains',
      expected: createToolCallMessage(generateImageToolDefinition.name),
    }
  ],
  scorers: [ToolCallMatch],
});