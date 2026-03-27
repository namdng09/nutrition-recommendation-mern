import type { Collection, Document as MongoDocument } from 'mongodb';
import mongoose from 'mongoose';

import { ragConfig } from '~/shared/config/rag';
import { ExerciseModel } from '~/shared/database/models';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';
import {
  createRagTextSplitter,
  createRagVectorStore,
  type RagChunkMetadata
} from '~/shared/utils';

type ExerciseRagRecord = {
  _id: mongoose.Types.ObjectId;
  name: string;
  tutorial?: string;
  instructions?: string;
  difficulty?: string;
  type?: string;
  logType?: string;
  muscles?: Array<{
    name?: string;
  }>;
  equipments?: Array<{
    name?: string;
  }>;
  isActive?: boolean;
  updatedAt?: Date;
};

type RagStoreDocument = {
  pageContent: string;
  metadata: {
    chunkId: string;
    metadata: RagChunkMetadata & {
      difficulty?: string;
      type?: string;
      logType?: string;
      muscles: string[];
      equipments: string[];
    };
  };
};

type RagVectorStore = {
  addDocuments: (documents: RagStoreDocument[]) => Promise<unknown>;
};

const exerciseSyncQueue = new Map<string, Promise<void>>();

const asNameArray = (
  value: Array<{ name?: string }> | undefined | null
): string[] =>
  (value ?? [])
    .map(item => item.name?.trim() ?? '')
    .filter((item): item is string => item.length > 0);

const uniqueStrings = (items: string[]) => Array.from(new Set(items));

const buildExerciseTags = (exercise: ExerciseRagRecord) => {
  const tags = [
    exercise.difficulty?.trim(),
    exercise.type?.trim(),
    exercise.logType?.trim(),
    ...asNameArray(exercise.muscles),
    ...asNameArray(exercise.equipments)
  ].filter((item): item is string => Boolean(item));

  return uniqueStrings(tags).slice(0, 20);
};

const buildExerciseText = (exercise: ExerciseRagRecord) => {
  const muscles = asNameArray(exercise.muscles);
  const equipments = asNameArray(exercise.equipments);
  const tags = buildExerciseTags(exercise);

  const lines: string[] = [
    `Exercise name: ${exercise.name}`,
    exercise.instructions?.trim()
      ? `Instructions: ${exercise.instructions.trim()}`
      : '',
    exercise.tutorial?.trim() ? `Tutorial: ${exercise.tutorial.trim()}` : '',
    exercise.difficulty?.trim() ? `Difficulty: ${exercise.difficulty}` : '',
    exercise.type?.trim() ? `Type: ${exercise.type}` : '',
    exercise.logType?.trim() ? `Log type: ${exercise.logType}` : '',
    muscles.length ? `Primary muscles: ${muscles.join(', ')}` : '',
    equipments.length ? `Equipments: ${equipments.join(', ')}` : '',
    tags.length ? `Tags: ${tags.join(', ')}` : ''
  ];

  return lines.filter(Boolean).join('\n').trim();
};

const getRagCollection = (): Collection<MongoDocument> => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB chưa kết nối, không thể đồng bộ RAG');
  }
  return db.collection(ragConfig.vectorCollectionName);
};

const buildChunkDocuments = async (
  exercise: ExerciseRagRecord
): Promise<RagStoreDocument[]> => {
  const splitter = createRagTextSplitter();
  const sourceId = exercise._id.toString();
  const text = buildExerciseText(exercise);
  const rawChunks = await splitter.splitText(text);
  const chunks = rawChunks.map(chunk => chunk.trim()).filter(Boolean);
  const finalChunks = chunks.length ? chunks : [text];
  const muscles = asNameArray(exercise.muscles);
  const equipments = asNameArray(exercise.equipments);

  return finalChunks.map((pageContent, index) => ({
    pageContent,
    metadata: {
      chunkId: `exercise:${sourceId}:chunk:${String(index + 1).padStart(4, '0')}`,
      metadata: {
        sourceType: 'exercise',
        sourceId,
        title: exercise.name,
        tags: buildExerciseTags(exercise),
        isPublic: true,
        updatedAt: exercise.updatedAt?.toISOString(),
        difficulty: exercise.difficulty,
        type: exercise.type,
        logType: exercise.logType,
        muscles,
        equipments
      }
    }
  }));
};

const deleteExerciseChunksById = async (exerciseId: string) => {
  const collection = getRagCollection();
  await collection.deleteMany({
    'metadata.sourceType': 'exercise',
    'metadata.sourceId': exerciseId
  });
};

const loadExerciseForRag = async (
  exerciseId: string
): Promise<ExerciseRagRecord | null> => {
  const exercise = await ExerciseModel.findById(exerciseId)
    .select(
      'name tutorial instructions difficulty type logType muscles equipments isActive updatedAt'
    )
    .lean();

  return (exercise as ExerciseRagRecord | null) ?? null;
};

const upsertExerciseChunksById = async (exerciseId: string) => {
  const exercise = await loadExerciseForRag(exerciseId);
  const eligible = Boolean(exercise?.isActive);

  if (!exercise || !eligible) {
    await deleteExerciseChunksById(exerciseId);
    console.log(
      `[RAG] Exercise ${exerciseId} not eligible (missing/inactive). Removed existing chunks`
    );
    return;
  }

  const collection = getRagCollection();
  const vectorStore = createRagVectorStore() as RagVectorStore;
  const documents = await buildChunkDocuments(exercise);

  await collection.deleteMany({
    'metadata.sourceType': 'exercise',
    'metadata.sourceId': exerciseId
  });
  await vectorStore.addDocuments(documents);

  console.log(
    `[RAG] Synced exercise ${exerciseId} with ${documents.length} chunk(s) after CRUD event`
  );
};

const enqueueByExerciseId = (exerciseId: string, task: () => Promise<void>) => {
  const previous = exerciseSyncQueue.get(exerciseId) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(task)
    .finally(() => {
      if (exerciseSyncQueue.get(exerciseId) === next) {
        exerciseSyncQueue.delete(exerciseId);
      }
    });

  exerciseSyncQueue.set(exerciseId, next);
  return next;
};

const safeSyncExercise = async (
  exerciseId: string,
  action: 'upsert' | 'delete'
) => {
  if (!ragConfig.enabled) return;
  if (!mongoose.isValidObjectId(exerciseId)) return;

  await enqueueByExerciseId(exerciseId, async () => {
    try {
      if (action === 'delete') {
        await deleteExerciseChunksById(exerciseId);
        console.log(`[RAG] Removed chunks for deleted exercise ${exerciseId}`);
        return;
      }
      await upsertExerciseChunksById(exerciseId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(
        `[RAG] Failed to ${action} chunks for exercise ${exerciseId}. Reason: ${reason}`
      );
    }
  });
};

export function registerExerciseRagSyncHandler(): void {
  const upsertEvents = [
    EVENTS.EXERCISE_CREATED,
    EVENTS.EXERCISE_UPDATED
  ] as const;

  upsertEvents.forEach(event => {
    eventBus.on(event, async (payload: EventPayloads[typeof event]) => {
      await safeSyncExercise(payload.exerciseId, 'upsert');
    });
  });

  eventBus.on(
    EVENTS.EXERCISE_DELETED,
    async (payload: EventPayloads[typeof EVENTS.EXERCISE_DELETED]) => {
      await safeSyncExercise(payload.exerciseId, 'delete');
    }
  );
}
