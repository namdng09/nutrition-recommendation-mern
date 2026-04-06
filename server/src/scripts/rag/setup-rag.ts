import dotenv from 'dotenv';
import type { Collection, Document as MongoDocument } from 'mongodb';
import mongoose from 'mongoose';

import { connectDB } from '~/shared/config/database';
import { ragConfig, ragEmbeddings } from '~/shared/config/rag';

dotenv.config();

const warnIfNotAtlas = () => {
  const host = mongoose.connection.host;
  if (!host) return;

  if (!host.includes('mongodb.net')) {
    console.warn(
      `[RAG] Cảnh báo: host "${host}" không giống MongoDB Atlas (mongodb.net). ` +
        'Nếu bạn dùng MongoDB local/self-hosted thì Atlas Vector Search API có thể không khả dụng.'
    );
  }
};

const ensureCollection = async (
  name: string
): Promise<Collection<MongoDocument>> => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB chưa kết nối, không thể setup RAG');
  }

  const existed = await db.listCollections({ name }).hasNext();
  if (!existed) {
    await db.createCollection(name);
    console.log(`[RAG] Created collection "${name}"`);
  }

  return db.collection(name);
};

const assertVectorSearchSupport = async (
  collection: Collection<MongoDocument>
) => {
  try {
    await collection.listSearchIndexes().toArray();
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      'MongoDB hiện tại không hỗ trợ Atlas Vector Search (listSearchIndexes/createSearchIndex). ' +
        `Hãy kiểm tra MONGO_URI đang trỏ đúng MongoDB Atlas cluster (MongoDB 7.0+). Chi tiết: ${reason}`
    );
  }
};

const resolveEmbeddingDimensions = async () => {
  if (typeof ragConfig.embeddingDimensions === 'number') {
    return ragConfig.embeddingDimensions;
  }

  const probeVector = await ragEmbeddings.embedQuery('rag dimension probe');
  return probeVector.length;
};

const upsertVectorIndex = async (
  collection: Collection<MongoDocument>,
  dimensions: number
) => {
  const definition = {
    fields: [
      {
        type: 'vector',
        path: ragConfig.embeddingKey,
        numDimensions: dimensions,
        similarity: ragConfig.vectorSimilarity
      },
      { type: 'filter', path: 'metadata.sourceType' },
      { type: 'filter', path: 'metadata.sourceId' },
      { type: 'filter', path: 'metadata.isPublic' }
    ]
  };

  const currentIndexes = await collection
    .listSearchIndexes(ragConfig.vectorIndexName)
    .toArray();

  if (!currentIndexes.length) {
    await collection.createSearchIndex({
      name: ragConfig.vectorIndexName,
      type: 'vectorSearch',
      definition
    } as any);
    console.log(
      `[RAG] Created vector index "${ragConfig.vectorIndexName}" (${dimensions} dims)`
    );
    return;
  }

  await collection.updateSearchIndex(
    ragConfig.vectorIndexName,
    definition as any
  );
  console.log(
    `[RAG] Updated vector index "${ragConfig.vectorIndexName}" (${dimensions} dims)`
  );
};

const ensureMetadataIndexes = async (collection: Collection<MongoDocument>) => {
  await collection.createIndex({ chunkId: 1 }, { unique: true, sparse: true });
  await collection.createIndex({
    'metadata.sourceType': 1,
    'metadata.sourceId': 1
  });
  await collection.createIndex({ 'metadata.updatedAt': -1 });
  console.log('[RAG] Ensured metadata indexes');
};

const run = async () => {
  try {
    await connectDB();
    warnIfNotAtlas();
    const collection = await ensureCollection(ragConfig.vectorCollectionName);
    await assertVectorSearchSupport(collection);
    const dimensions = await resolveEmbeddingDimensions();
    await upsertVectorIndex(collection, dimensions);
    await ensureMetadataIndexes(collection);
    console.log('[RAG] Setup completed');
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[RAG] Setup failed: ${message}`);
  process.exit(1);
});
