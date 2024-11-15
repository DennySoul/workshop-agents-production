import { runEval } from '../evalTools.ts'
import { runLLM } from '../../../src/llm.ts'
import { dadJokeToolDefinition } from '../../../src/tools/dadJoke.ts'
import { ToolCallMatch } from '../scorers.ts'
import { generateImageToolDefinition } from '../../../src/tools/generateImage.ts'
import { redditToolDefinition } from '../../../src/tools/reddit.ts'

const createToolCallMessage = (toolName: string) => ({
  role: 'assistant',
  tool_calls: [
    {
      type: 'function',
      function: { name: toolName }
    }
  ]
})

await runEval('allTools', {
  task: async input => runLLM({
    messages: [{ role: 'user', content: input }],
    tools: [
      dadJokeToolDefinition,
      generateImageToolDefinition,
      redditToolDefinition
    ]
  }),
  data: [{
    input: 'tell me a dad joke',
    expected: createToolCallMessage(dadJokeToolDefinition.name)
  }, {
    input: 'generate image of a mountains',
    expected: createToolCallMessage(generateImageToolDefinition.name)
  }, {
    input: 'tell me top reddit post',
    expected: createToolCallMessage(redditToolDefinition.name)
  }],
  scorers: [ToolCallMatch]
})