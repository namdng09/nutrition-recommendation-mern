import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';
import { createAgent } from 'langchain';

import { googleApiKey } from '~/shared/config/google-genai';
import { DEFAULT_SYSTEM_PROMPT } from '~/shared/constants/ai-prompt';

dotenv.config();

export const agentConfig = {
  provider: 'gemini' as const,
  model: 'gemini-2.5-flash',
  systemPrompt: DEFAULT_SYSTEM_PROMPT
};

const model = new ChatGoogleGenerativeAI({
  apiKey: googleApiKey,
  model: agentConfig.model,
  temperature: 0.3,
  maxOutputTokens: 512
});

export const agent = createAgent({
  model,
  systemPrompt: agentConfig.systemPrompt
});
