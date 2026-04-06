import dotenv from 'dotenv';
import type { Collection, Document as MongoDocument } from 'mongodb';
import mongoose from 'mongoose';

import { connectDB } from '~/shared/config/database';
import { ragConfig } from '~/shared/config/rag';
import { ExerciseModel } from '~/shared/database/models';
import {
  createRagTextSplitter,
  createRagVectorStore,
  type RagChunkMetadata
} from '~/shared/utils';

dotenv.config();

type CliArgs = {
  sourceId?: string;
  limit?: number;
  dryRun: boolean;
  help: boolean;
};

type ExerciseRecord = {
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

const parseArgs = (rawArgs: string[]): CliArgs => {
  const args: CliArgs = {
    dryRun: false,
    help: false
  };

  for (const arg of rawArgs) {
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (arg.startsWith('--sourceId=')) {
      args.sourceId = arg.slice('--sourceId='.length).trim();
      continue;
    }
    if (arg.startsWith('--limit=')) {
      const parsed = Number.parseInt(arg.slice('--limit='.length), 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('Tham số --limit phải là số nguyên dương');
      }
      args.limit = parsed;
      continue;
    }

    throw new Error(`Tham số không hợp lệ: ${arg}`);
  }

  if (args.sourceId && !mongoose.isValidObjectId(args.sourceId)) {
    throw new Error(`sourceId không hợp lệ: "${args.sourceId}"`);
  }
  if (args.sourceId && args.limit) {
    throw new Error('Không thể dùng --sourceId cùng với --limit');
  }

  return args;
};

const printHelp = () => {
  console.log('RAG exercise ingest script');
  console.log('');
  console.log('Usage:');
  console.log('  npm run rag:ingest:exercises');
  console.log(
    '  npm run rag:ingest:exercises -- --sourceId=<exerciseObjectId>'
  );
  console.log('  npm run rag:ingest:exercises -- --limit=50');
  console.log('  npm run rag:ingest:exercises -- --dry-run');
};

const asNameArray = (
  value: Array<{ name?: string }> | undefined | null
): string[] =>
  (value ?? [])
    .map(item => item.name?.trim() ?? '')
    .filter((item): item is string => item.length > 0);

const uniqueStrings = (items: string[]) => Array.from(new Set(items));

const buildExerciseTags = (exercise: ExerciseRecord) => {
  const tags = [
    exercise.difficulty?.trim(),
    exercise.type?.trim(),
    exercise.logType?.trim(),
    ...asNameArray(exercise.muscles),
    ...asNameArray(exercise.equipments)
  ].filter((item): item is string => Boolean(item));

  return uniqueStrings(tags).slice(0, 20);
};

const buildExerciseText = (exercise: ExerciseRecord) => {
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
    throw new Error('MongoDB chưa kết nối, không thể ingest RAG');
  }
  return db.collection(ragConfig.vectorCollectionName);
};

const buildChunkDocuments = async (
  exercise: ExerciseRecord,
  splitter: ReturnType<typeof createRagTextSplitter>
): Promise<RagStoreDocument[]> => {
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

const loadTargetExercises = async (
  args: CliArgs
): Promise<ExerciseRecord[]> => {
  const query: Record<string, unknown> = {
    isActive: true
  };

  if (args.sourceId) {
    query._id = new mongoose.Types.ObjectId(args.sourceId);
  }

  let mongoQuery = ExerciseModel.find(query)
    .select(
      'name tutorial instructions difficulty type logType muscles equipments updatedAt'
    )
    .sort({ updatedAt: -1 });

  if (args.limit) {
    mongoQuery = mongoQuery.limit(args.limit);
  }

  const exercises = await mongoQuery.lean();
  return exercises as unknown as ExerciseRecord[];
};

const run = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  await connectDB();

  try {
    const collection = getRagCollection();
    const splitter = createRagTextSplitter();
    const vectorStore = args.dryRun
      ? null
      : (createRagVectorStore() as RagVectorStore);
    const exercises = await loadTargetExercises(args);

    if (args.sourceId && exercises.length === 0) {
      if (!args.dryRun) {
        const result = await collection.deleteMany({
          'metadata.sourceType': 'exercise',
          'metadata.sourceId': args.sourceId
        });
        console.log(
          `[RAG] Exercise ${args.sourceId} không còn eligible (active). Removed ${result.deletedCount} chunks`
        );
      } else {
        console.log(
          `[RAG] Dry-run: exercise ${args.sourceId} không có trong tập eligible (active)`
        );
      }
      return;
    }

    if (!args.sourceId && !args.limit && !args.dryRun) {
      const eligibleIds = exercises.map(exercise => exercise._id.toString());
      if (!eligibleIds.length) {
        const result = await collection.deleteMany({
          'metadata.sourceType': 'exercise'
        });
        console.log(
          `[RAG] Không có exercise eligible. Removed ${result.deletedCount} existing chunks`
        );
        return;
      }

      const staleResult = await collection.deleteMany({
        'metadata.sourceType': 'exercise',
        'metadata.sourceId': { $nin: eligibleIds }
      });
      if (staleResult.deletedCount) {
        console.log(
          `[RAG] Removed ${staleResult.deletedCount} stale exercise chunks`
        );
      }
    }

    if (!args.sourceId && args.limit) {
      console.log(
        '[RAG] Running in partial mode (--limit). Stale cleanup is skipped.'
      );
    }

    let totalChunks = 0;

    for (let i = 0; i < exercises.length; i += 1) {
      const exercise = exercises[i];
      const sourceId = exercise._id.toString();
      const documents = await buildChunkDocuments(exercise, splitter);
      totalChunks += documents.length;

      if (!args.dryRun) {
        await collection.deleteMany({
          'metadata.sourceType': 'exercise',
          'metadata.sourceId': sourceId
        });
        if (!vectorStore) {
          throw new Error('Vector store chưa được khởi tạo');
        }
        await vectorStore.addDocuments(documents);
      }

      console.log(
        `[RAG] ${args.dryRun ? 'Would ingest' : 'Ingested'} exercise ${sourceId} (${documents.length} chunks) [${i + 1}/${exercises.length}]`
      );
    }

    console.log(
      `[RAG] Exercise ingest completed. Exercises=${exercises.length}, Chunks=${totalChunks}, DryRun=${args.dryRun}`
    );
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[RAG] Exercise ingest failed: ${message}`);
  process.exit(1);
});
