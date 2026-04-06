import { registerDishRagSyncHandler } from './rag-dish-sync-handler';
import { registerExerciseRagSyncHandler } from './rag-exercise-sync-handler';

export function registerAllEventHandlers(): void {
  registerDishRagSyncHandler();
  registerExerciseRagSyncHandler();
}
