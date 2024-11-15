import { addMessages, getMessages, saveToolResponse } from './memory'
import { runLLM, runApprovalCheck } from './llm'
import { showLoader, logMessage } from './ui'
import { runTool } from './toolRunner'
import type { AIMessage } from '../types'
import { generateImageToolDefinition } from './tools/generateImage'

async function handleApprovalFlow(
  history: AIMessage[],
  userMessage: string,
) {
  const lastMessage = history.at(-1);
  // @ts-expect-error - TS doesn't know that tool_calls is a property of AIMessage
  const toolCall = lastMessage?.tool_calls?.[0];

  if (!toolCall || toolCall.function.name !== generateImageToolDefinition.name) {
    return;
  }

  const loader = showLoader('🤔');
  const approved = await runApprovalCheck(userMessage);

  if (approved) {
    loader.update('Approved! Generating image...');
    
    const toolResponse = await runTool(toolCall, userMessage);

    loader.update(`Tool call: ${toolCall.function.name} completed!`);

    await saveToolResponse(toolCall.id, toolResponse);
  } else {
    loader.update('Not approved. Cancelling...');

    await saveToolResponse(toolCall.id, 'User did not approve an action.');
  }

  loader.stop();

  return true;
}

export const runAgent = async ({
  userMessage,
  tools,
}: {
  userMessage: string
  tools: any[]
}) => {
  const history = await getMessages();
  const isApprovalFlow = await handleApprovalFlow(history, userMessage);

  if (!isApprovalFlow) {
    await addMessages([{ role: 'user', content: userMessage }]);
  }

  const loader = showLoader('🤔');

  while (true) {
    const history = await getMessages()
    const response = await runLLM({ messages: history, tools });

    await addMessages([response])

    if (response?.content) {
      loader.stop()
      logMessage(response)
      return getMessages()
    }

    if (response?.tool_calls) {
      const toolCall = response?.tool_calls?.[0]
      logMessage(response)
      loader.update(`executing: ${toolCall.function.name}`)

      if (toolCall.function.name === generateImageToolDefinition.name) {
        loader.update('Awaiting approval...')
        loader.stop();
        return getMessages();
      }

      const toolResponse = await runTool(toolCall, userMessage)
      await saveToolResponse(toolCall.id, toolResponse)
      loader.update(`done: ${toolCall.function.name}`)
    }
  }
}
