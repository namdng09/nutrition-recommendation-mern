import { registerBulkOrganizerHandler } from './bulk-organizer';
import { registerCommunityBeaconHandler } from './community-beacon';
import { registerIngredientExplorerHandler } from './ingredient-explorer';
import { registerKitchenManagerHandler } from './kitchen-manager';
import { registerLifestyleArchitectHandler } from './lifestyle-architect';
import { registerNutritionalPolymathHandler } from './nutritional-polymath';
import { registerOnTheMarkHandler } from './on-the-mark';
import { registerPhaseMasterHandler } from './phase-master';
import { registerSparkOfInterestHandler } from './spark-of-interest';
import { registerTheDisciplinedHandler } from './the-disciplined';
import { registerThePlannerHandler } from './the-planner';
import { registerUnyieldingProgressHandler } from './unyielding-progress';
import { registerVarietySeekerHandler } from './variety-seeker';

export function registerAllAchievementHandlers(): void {
  registerThePlannerHandler();
  registerTheDisciplinedHandler();
  registerLifestyleArchitectHandler();

  registerIngredientExplorerHandler();
  registerNutritionalPolymathHandler();
  registerVarietySeekerHandler();

  registerSparkOfInterestHandler();
  registerCommunityBeaconHandler();

  registerOnTheMarkHandler();
  registerPhaseMasterHandler();
  registerUnyieldingProgressHandler();

  registerKitchenManagerHandler();
  registerBulkOrganizerHandler();
}
