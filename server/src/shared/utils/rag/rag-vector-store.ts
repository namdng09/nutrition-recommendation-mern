import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import createHttpError from 'http-errors';
import type { Collection, Document as MongoDocument } from 'mongodb';
import mongoose from 'mongoose';

import { ragConfig, ragEmbeddings } from '~/shared/config/rag';

const ensureRagCollection = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw createHttpError(
      500,
      'MongoDB chưa kết nối, không thể khởi tạo vector store cho RAG'
    );
  }

  return db.collection(ragConfig.vectorCollectionName);
};

const asLangChainCompatibleCollection = (
  collection: Collection<MongoDocument>
): Collection<MongoDocument> => {
  const mongoClient = mongoose.connection.getClient() as any;
  const currentClient = (collection as any)?.db?.client ?? mongoClient;
  const clientWithMetadata =
    typeof currentClient?.appendMetadata === 'function'
      ? currentClient
      : {
          ...currentClient,
          appendMetadata: () => undefined
        };

  const dbShim = { client: clientWithMetadata };

  return new Proxy(collection as any, {
    get(target, prop) {
      if (prop === 'db') return dbShim;
      const value = target[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    }
  }) as Collection<MongoDocument>;
};

export const createRagVectorStore = () => {
  const collection = asLangChainCompatibleCollection(ensureRagCollection());

  return new MongoDBAtlasVectorSearch(ragEmbeddings, {
    collection: collection as any,
    indexName: ragConfig.vectorIndexName,
    textKey: ragConfig.textKey,
    embeddingKey: ragConfig.embeddingKey
  });
};
