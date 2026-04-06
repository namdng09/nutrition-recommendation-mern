import type { Collection, Document as MongoDocument } from 'mongodb';
import mongoose from 'mongoose';

import { ragConfig } from '~/shared/config/rag';
import { DishModel } from '~/shared/database/models';
import { eventBus } from '~/shared/events/event-bus';
import { type EventPayloads, EVENTS } from '~/shared/events/event-types';
import {
  createRagTextSplitter,
  createRagVectorStore,
  type RagChunkMetadata
} from '~/shared/utils';

type DishRagRecord = {
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
  isActive?: boolean;
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

const dishSyncQueue = new Map<string, Promise<void>>();

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

const buildDishText = (dish: DishRagRecord) => {
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
    throw new Error('MongoDB chưa kết nối, không thể đồng bộ RAG');
  }
  return db.collection(ragConfig.vectorCollectionName);
};

const buildChunkDocuments = async (
  dish: DishRagRecord
): Promise<RagStoreDocument[]> => {
  const splitter = createRagTextSplitter();
  const sourceId = dish._id.toString();
  const text = buildDishText(dish);
  const rawChunks = await splitter.splitText(text);
  const chunks = rawChunks.map(chunk => chunk.trim()).filter(Boolean);
  const finalChunks = chunks.length ? chunks : [text];
  const categories = asStringArray(dish.categories);
  const nutritionFocus = asStringArray(dish.nutritionFocus);
  const totalTimeMinutes =
    (dish.preparationTime ?? 0) + (dish.cookTime ?? 0) || undefined;

  return finalChunks.map((pageContent, index) => ({
    pageContent,
    metadata: {
      chunkId: `dish:${sourceId}:chunk:${String(index + 1).padStart(4, '0')}`,
      metadata: {
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
      }
    }
  }));
};

const deleteDishChunksById = async (dishId: string) => {
  const collection = getRagCollection();
  await collection.deleteMany({
    'metadata.sourceType': 'dish',
    'metadata.sourceId': dishId
  });
};

const loadDishForRag = async (
  dishId: string
): Promise<DishRagRecord | null> => {
  const dish = await DishModel.findById(dishId)
    .select(
      'name description categories nutritionFocus tags preparationTime cookTime servings ingredients instructions nutrition isActive isPublic updatedAt'
    )
    .lean();

  return (dish as DishRagRecord | null) ?? null;
};

const upsertDishChunksById = async (dishId: string) => {
  const dish = await loadDishForRag(dishId);
  const eligible = Boolean(dish?.isActive && dish?.isPublic);

  if (!dish || !eligible) {
    await deleteDishChunksById(dishId);
    console.log(
      `[RAG] Dish ${dishId} not eligible (missing/inactive/private). Removed existing chunks`
    );
    return;
  }

  const collection = getRagCollection();
  const vectorStore = createRagVectorStore() as RagVectorStore;
  const documents = await buildChunkDocuments(dish);

  await collection.deleteMany({
    'metadata.sourceType': 'dish',
    'metadata.sourceId': dishId
  });
  await vectorStore.addDocuments(documents);

  console.log(
    `[RAG] Synced dish ${dishId} with ${documents.length} chunk(s) after CRUD event`
  );
};

const enqueueByDishId = (dishId: string, task: () => Promise<void>) => {
  const previous = dishSyncQueue.get(dishId) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(task)
    .finally(() => {
      if (dishSyncQueue.get(dishId) === next) {
        dishSyncQueue.delete(dishId);
      }
    });

  dishSyncQueue.set(dishId, next);
  return next;
};

const safeSyncDish = async (dishId: string, action: 'upsert' | 'delete') => {
  if (!ragConfig.enabled) return;
  if (!mongoose.isValidObjectId(dishId)) return;

  await enqueueByDishId(dishId, async () => {
    try {
      if (action === 'delete') {
        await deleteDishChunksById(dishId);
        console.log(`[RAG] Removed chunks for deleted dish ${dishId}`);
        return;
      }
      await upsertDishChunksById(dishId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(
        `[RAG] Failed to ${action} chunks for dish ${dishId}. Reason: ${reason}`
      );
    }
  });
};

export function registerDishRagSyncHandler(): void {
  const upsertEvents = [EVENTS.DISH_CREATED, EVENTS.DISH_UPDATED] as const;

  upsertEvents.forEach(event => {
    eventBus.on(event, async (payload: EventPayloads[typeof event]) => {
      await safeSyncDish(payload.dishId, 'upsert');
    });
  });

  eventBus.on(
    EVENTS.DISH_DELETED,
    async (payload: EventPayloads[typeof EVENTS.DISH_DELETED]) => {
      await safeSyncDish(payload.dishId, 'delete');
    }
  );
}
