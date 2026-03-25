import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';

import { googleApiKey } from './google-genai';

dotenv.config();

const parseInteger = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseOptionalInteger = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBoolean = (value: string | undefined, fallback = false) => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const rawChunkSize = parseInteger(process.env.RAG_CHUNK_SIZE, 900);
const rawChunkOverlap = parseInteger(process.env.RAG_CHUNK_OVERLAP, 120);
const safeChunkOverlap = Math.max(
  0,
  Math.min(rawChunkOverlap, rawChunkSize - 1)
);

const similarityRaw = process.env.RAG_VECTOR_SIMILARITY?.trim().toLowerCase();
const similarity =
  similarityRaw === 'dotproduct'
    ? 'dotProduct'
    : similarityRaw === 'euclidean'
      ? 'euclidean'
      : 'cosine';

export const ragConfig = {
  enabled: parseBoolean(process.env.RAG_ENABLED, false),
  vectorCollectionName:
    process.env.RAG_VECTOR_COLLECTION?.trim() || 'rag_chunks',
  vectorIndexName: process.env.RAG_VECTOR_INDEX?.trim() || 'rag_vector_index',
  textKey: process.env.RAG_TEXT_KEY?.trim() || 'text',
  embeddingKey: process.env.RAG_EMBEDDING_KEY?.trim() || 'embedding',
  embeddingModel:
    process.env.RAG_EMBEDDING_MODEL?.trim() || 'text-embedding-004',
  embeddingDimensions: parseOptionalInteger(
    process.env.RAG_EMBEDDING_DIMENSIONS
  ),
  vectorSimilarity: similarity,
  chunkSize: rawChunkSize,
  chunkOverlap: safeChunkOverlap,
  defaultTopK: parseInteger(process.env.RAG_DEFAULT_TOP_K, 6)
} as const;

export const ragEmbeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: googleApiKey,
  model: ragConfig.embeddingModel
});
