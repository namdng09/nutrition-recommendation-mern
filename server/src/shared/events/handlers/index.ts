import { registerDishRagSyncHandler } from './rag-dish-sync-handler';

export function registerAllEventHandlers(): void {
  registerDishRagSyncHandler();
}
