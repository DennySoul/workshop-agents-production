import type { AIMessage } from '../types'
import { openai } from './ai'
import { zodFunction, zodResponseFormat } from 'openai/helpers/zod'
import { systemPrompt as defaultSystemPrompt } from './systemPrompt'
import zod from 'zod'
import { getSymmary } from './memory'

export const runLLM = async ({
  messages,
  tools = [],
  temperature = 0.1,
  systemPrompt,
}: {
  messages: AIMessage[]
  tools?: any[]
  temperature?: number
  systemPrompt?: string
}) => {
  const formattedTools = tools.map(zodFunction);
  const summary = await getSymmary();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature,
    messages: [
      {
        role: 'system',
        content: `${systemPrompt || defaultSystemPrompt}. Conversation so far:`,
      },
      ...messages,
    ],
    ...(formattedTools.length > 0 && {
      tools: formattedTools,
      tool_choice: 'auto',
      parallel_tool_calls: false,
    }),
  });

  return response.choices[0].message;
}

export const runApprovalCheck = async (userMessage: string) => {
  const result = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: zodResponseFormat(zod.object({
      approved: zod.boolean().describe('indicates if user has approved and action or not approved'),
    }), 'approval'),
    messages: [
      { role: 'system', content: 'You are a helpful assistant; Your job is to determine if the given user message indicates an approval to an action or not an approval.' },
      { role: 'user', content: userMessage }],
  })

  return result.choices[0]?.message?.parsed?.approved;
}

export const summarizeMessages = async (messages: AIMessage[]) => {
  const response = await runLLM({
    messages,
    systemPrompt: 'You are a helpful assistant; Your job is to summarize the given messages. Summarize it play by play.',
    temperature: 0.4,
  });

  return response?.content ?? '';
}