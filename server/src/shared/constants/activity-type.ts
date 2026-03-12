export const ACTIVITY_TYPE = {
  STRENGTH: 'Strength',
  STRETCHING: 'Stretching',
  POWER: 'Power',
  OLYMPIC: 'Olympic',
  EXPLOSIVE: 'Explosive',
  MOBILITY: 'Mobility',
  DYNAMIC: 'Dynamic',
  YOGA: 'Yoga'
} as const;

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];
