import type { Response } from 'express';

type SseEventPayload = {
  type: string;
  [key: string]: unknown;
};

type ClientConnection = {
  response: Response;
  keepAliveTimer: ReturnType<typeof setInterval>;
};

const clients = new Map<string, ClientConnection>();

const writeSseData = (res: Response, data: unknown): void => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const registerAchievementSseClient = (
  userId: string,
  response: Response
): void => {
  const existingClient = clients.get(userId);
  if (existingClient) {
    clearInterval(existingClient.keepAliveTimer);
    existingClient.response.end();
  }

  const keepAliveTimer = setInterval(() => {
    response.write(': keepalive\n\n');
  }, 30_000);

  clients.set(userId, {
    response,
    keepAliveTimer
  });
};

export const removeAchievementSseClient = (userId: string): void => {
  const client = clients.get(userId);
  if (!client) return;

  clearInterval(client.keepAliveTimer);
  clients.delete(userId);
};

export const sendAchievementSseEvent = (
  userId: string,
  payload: SseEventPayload
): void => {
  const client = clients.get(userId);
  if (!client) return;

  writeSseData(client.response, payload);
};
