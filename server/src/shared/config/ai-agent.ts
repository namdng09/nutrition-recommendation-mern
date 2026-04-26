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
  maxOutputTokens: 2048
});

export const agent = createAgent({
  model,
  systemPrompt: agentConfig.systemPrompt
});

export const evaluationConfig = {
  provider: 'gemini' as const,
  model: 'gemini-2.5-flash-lite',
  systemPrompt: DEFAULT_SYSTEM_PROMPT
};

const evaluationModel = new ChatGoogleGenerativeAI({
  apiKey: googleApiKey,
  model: evaluationConfig.model,
  temperature: 0.3,
  maxOutputTokens: 1024
});

export const evaluationAgent = createAgent({
  model: evaluationModel,
  systemPrompt: evaluationConfig.systemPrompt
});
