export const RAG_SOURCE_TYPES = ['dish', 'exercise'] as const;

export type RagSourceType = (typeof RAG_SOURCE_TYPES)[number];

export interface RagChunkMetadata {
  sourceType: RagSourceType;
  sourceId: string;
  title: string;
  tags?: string[];
  isPublic?: boolean;
  updatedAt?: string;
}

export interface RagChunkPayload {
  id: string;
  text: string;
  metadata: RagChunkMetadata;
}
