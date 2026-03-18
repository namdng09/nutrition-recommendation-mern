export const EVENTS = {
  SCHEDULE_DISH_EATEN: 'schedule:dish_eaten',
  SCHEDULE_CREATED: 'schedule:created',
  DISH_CREATED: 'dish:created',
  USER_LOGGED_IN: 'user:logged_in'
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export type EventPayloads = {
  [EVENTS.SCHEDULE_DISH_EATEN]: {
    userId: string;
    dishId: string;
    scheduleId: string;
  };
  [EVENTS.SCHEDULE_CREATED]: {
    userId: string;
    scheduleId: string;
  };
  [EVENTS.DISH_CREATED]: {
    userId: string;
    dishId: string;
  };
  [EVENTS.USER_LOGGED_IN]: {
    userId: string;
    loginStreak: number;
  };
};
