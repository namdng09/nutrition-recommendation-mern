export const EVENTS = {
  SCHEDULE_DISH_EATEN: 'schedule:dish_eaten',
  SCHEDULE_CREATED: 'schedule:created',
  DISH_CREATED: 'dish:created',
  POST_LIKED: 'post:liked',
  POST_UNLIKED: 'post:unliked',
  POST_COMMENTED: 'post:commented',
  POST_COMMENT_DELETED: 'post:comment_deleted',
  GROCERY_CREATED: 'grocery:created',
  GROCERY_INGREDIENT_PURCHASED: 'grocery:ingredient_purchased'
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
  [EVENTS.POST_LIKED]: {
    actorId: string;
    authorId: string;
    postId: string;
  };
  [EVENTS.POST_UNLIKED]: {
    actorId: string;
    authorId: string;
    postId: string;
  };
  [EVENTS.POST_COMMENTED]: {
    actorId: string;
    authorId: string;
    postId: string;
  };
  [EVENTS.POST_COMMENT_DELETED]: {
    actorId: string;
    authorId: string;
    postId: string;
  };
  [EVENTS.GROCERY_CREATED]: {
    userId: string;
    groceryId: string;
  };
  [EVENTS.GROCERY_INGREDIENT_PURCHASED]: {
    userId: string;
    groceryId: string;
  };
};
