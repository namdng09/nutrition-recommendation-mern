import { describe, expect, it } from 'vitest';

import { AchievementService } from '~/features/achievements/achievement-service';
import { ACHIEVEMENTS } from '~/shared/constants/achievement';

describe('AchievementService.getAllDefinitions', () => {
  describe('business logic', () => {
    it('should return all achievement definitions', () => {
      const result = AchievementService.getAllDefinitions();
      const expected = Object.values(ACHIEVEMENTS);

      expect(result).toHaveLength(expected.length);
      expect(result).toEqual(expected);
    });
  });
});
