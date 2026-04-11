import dotenv from 'dotenv';
import type { Collection, Document as MongoDocument } from 'mongodb';
import mongoose from 'mongoose';

import { connectDB } from '~/shared/config/database';
import { ragConfig } from '~/shared/config/rag';
import { DishModel } from '~/shared/database/models';
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

type DishRecord = {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  categories?: string[];
  nutritionFocus?: string[];
  tags?: string[];
  preparationTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients?: Array<{
    name?: string;
    description?: string;
    allergens?: string[];
  }>;
  instructions?: Array<{
    step?: number;
    description?: string;
  }>;
  nutrition?: {
    nutrients?: Array<{ label?: string; value?: number; unit?: string }>;
    minerals?: Array<{ label?: string; value?: number; unit?: string }>;
    vitamins?: Array<{ label?: string; value?: number; unit?: string }>;
  } | null;
  isPublic?: boolean;
  updatedAt?: Date;
};

type RagStoreDocument = {
  pageContent: string;
  metadata: {
    chunkId: string;
    metadata: RagChunkMetadata & {
      categories: string[];
      nutritionFocus: string[];
      totalTimeMinutes?: number;
      servings?: number;
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
  console.log('RAG dish ingest script');
  console.log('');
  console.log('Usage:');
  console.log('  npm run rag:ingest:dishes');
  console.log('  npm run rag:ingest:dishes -- --sourceId=<dishObjectId>');
  console.log('  npm run rag:ingest:dishes -- --limit=50');
  console.log('  npm run rag:ingest:dishes -- --dry-run');
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(item => typeof item === 'string');
};

const formatNutritionSection = (
  title: string,
  items: Array<{ label?: string; value?: number; unit?: string }> | undefined
) => {
  if (!items?.length) return [];

  const rows = items
    .filter(
      item => typeof item.label === 'string' && typeof item.value === 'number'
    )
    .slice(0, 16)
    .map(item => {
      const unit = item.unit ? ` ${item.unit}` : '';
      return `- ${item.label}: ${item.value}${unit}`;
    });

  if (!rows.length) return [];

  return [`${title}:`, ...rows];
};

const buildDishText = (dish: DishRecord) => {
  const categories = asStringArray(dish.categories);
  const nutritionFocus = asStringArray(dish.nutritionFocus);
  const tags = asStringArray(dish.tags);
  const totalTimeMinutes =
    (dish.preparationTime ?? 0) + (dish.cookTime ?? 0) || undefined;

  const ingredientLines = (dish.ingredients ?? [])
    .map(item => {
      const name = item.name?.trim() || 'N/A';
      const note = item.description?.trim();
      const allergens = asStringArray(item.allergens);
      const allergenText = allergens.length
        ? ` | allergens: ${allergens.join(', ')}`
        : '';
      const noteText = note ? ` | note: ${note}` : '';
      return `- ${name}${allergenText}${noteText}`;
    })
    .filter(Boolean);

  const instructionLines = [...(dish.instructions ?? [])]
    .sort((left, right) => (left.step ?? 0) - (right.step ?? 0))
    .map(item => {
      const step = item.step ?? 0;
      const description = item.description?.trim() || '';
      return description ? `- Step ${step}: ${description}` : '';
    })
    .filter(Boolean);

  const lines: string[] = [
    `Dish name: ${dish.name}`,
    dish.description ? `Description: ${dish.description.trim()}` : '',
    categories.length ? `Categories: ${categories.join(', ')}` : '',
    nutritionFocus.length
      ? `Nutrition focus: ${nutritionFocus.join(', ')}`
      : '',
    tags.length ? `Tags: ${tags.join(', ')}` : '',
    typeof dish.servings === 'number' ? `Servings: ${dish.servings}` : '',
    typeof totalTimeMinutes === 'number'
      ? `Total time (minutes): ${totalTimeMinutes}`
      : ''
  ];

  if (ingredientLines.length) {
    lines.push('Ingredients:');
    lines.push(...ingredientLines);
  }
  if (instructionLines.length) {
    lines.push('Instructions:');
    lines.push(...instructionLines);
  }

  lines.push(
    ...formatNutritionSection('Nutrients', dish.nutrition?.nutrients),
    ...formatNutritionSection('Minerals', dish.nutrition?.minerals),
    ...formatNutritionSection('Vitamins', dish.nutrition?.vitamins)
  );

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
  dish: DishRecord,
  splitter: ReturnType<typeof createRagTextSplitter>
): Promise<RagStoreDocument[]> => {
  const sourceId = dish._id.toString();
  const text = buildDishText(dish);
  const rawChunks = await splitter.splitText(text);
  const chunks = rawChunks.map(chunk => chunk.trim()).filter(Boolean);
  const finalChunks = chunks.length ? chunks : [text];
  const categories = asStringArray(dish.categories);
  const nutritionFocus = asStringArray(dish.nutritionFocus);
  const totalTimeMinutes =
    (dish.preparationTime ?? 0) + (dish.cookTime ?? 0) || undefined;

  return finalChunks.map((pageContent, index) => {
    const chunkMetadata: RagChunkMetadata & {
      categories: string[];
      nutritionFocus: string[];
      totalTimeMinutes?: number;
      servings?: number;
    } = {
      sourceType: 'dish',
      sourceId,
      title: dish.name,
      tags: asStringArray(dish.tags),
      isPublic: Boolean(dish.isPublic),
      updatedAt: dish.updatedAt?.toISOString(),
      categories,
      nutritionFocus,
      totalTimeMinutes,
      servings: dish.servings
    };

    return {
      pageContent,
      metadata: {
        chunkId: `dish:${sourceId}:chunk:${String(index + 1).padStart(4, '0')}`,
        metadata: chunkMetadata
      }
    };
  });
};

const loadTargetDishes = async (args: CliArgs): Promise<DishRecord[]> => {
  const query: Record<string, unknown> = {
    isActive: true,
    isPublic: true
  };

  if (args.sourceId) {
    query._id = new mongoose.Types.ObjectId(args.sourceId);
  }

  let mongoQuery = DishModel.find(query)
    .select(
      'name description categories nutritionFocus tags preparationTime cookTime servings ingredients instructions nutrition isPublic updatedAt'
    )
    .sort({ updatedAt: -1 });

  if (args.limit) {
    mongoQuery = mongoQuery.limit(args.limit);
  }

  const dishes = await mongoQuery.lean();
  return dishes as unknown as DishRecord[];
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
    const dishes = await loadTargetDishes(args);

    if (args.sourceId && dishes.length === 0) {
      if (!args.dryRun) {
        const result = await collection.deleteMany({
          'metadata.sourceType': 'dish',
          'metadata.sourceId': args.sourceId
        });
        console.log(
          `[RAG] Dish ${args.sourceId} không còn eligible (active/public). Removed ${result.deletedCount} chunks`
        );
      } else {
        console.log(
          `[RAG] Dry-run: dish ${args.sourceId} không có trong tập eligible (active/public)`
        );
      }
      return;
    }

    if (!args.sourceId && !args.limit && !args.dryRun) {
      const eligibleIds = dishes.map(dish => dish._id.toString());
      if (!eligibleIds.length) {
        const result = await collection.deleteMany({
          'metadata.sourceType': 'dish'
        });
        console.log(
          `[RAG] Không có dish eligible. Removed ${result.deletedCount} existing chunks`
        );
        return;
      }

      const staleResult = await collection.deleteMany({
        'metadata.sourceType': 'dish',
        'metadata.sourceId': { $nin: eligibleIds }
      });
      if (staleResult.deletedCount) {
        console.log(
          `[RAG] Removed ${staleResult.deletedCount} stale dish chunks`
        );
      }
    }

    if (!args.sourceId && args.limit) {
      console.log(
        '[RAG] Running in partial mode (--limit). Stale cleanup is skipped.'
      );
    }

    let totalChunks = 0;

    for (let i = 0; i < dishes.length; i += 1) {
      const dish = dishes[i];
      const sourceId = dish._id.toString();
      const documents = await buildChunkDocuments(dish, splitter);
      totalChunks += documents.length;

      if (!args.dryRun) {
        await collection.deleteMany({
          'metadata.sourceType': 'dish',
          'metadata.sourceId': sourceId
        });
        if (!vectorStore) {
          throw new Error('Vector store chưa được khởi tạo');
        }
        await vectorStore.addDocuments(documents);
      }

      console.log(
        `[RAG] ${args.dryRun ? 'Would ingest' : 'Ingested'} dish ${sourceId} (${documents.length} chunks) [${i + 1}/${dishes.length}]`
      );
    }

    console.log(
      `[RAG] Dish ingest completed. Dishes=${dishes.length}, Chunks=${totalChunks}, DryRun=${args.dryRun}`
    );
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[RAG] Dish ingest failed: ${message}`);
  process.exit(1);
});
