import { randomUUID } from "crypto";

export interface SessionData {
  sessionId: string;
  username: string;
  valid: boolean;
}

export const sessions: Record<string, SessionData> = {};

export function getSession(sessionId: string): SessionData | null {
  const session = sessions[sessionId];

  return session.valid ? session : null;
}

export function invalidateSession(sessionId: string): SessionData {
  const session = sessions[sessionId];

  if (session !== null) {
    sessions[sessionId].valid = false;
  }

  return sessions[sessionId];
}

export function createSession(username: string): SessionData {
  const sessionId = randomUUID();

  const session = { sessionId, username, valid: true }

  sessions[sessionId] = session;

  return session;
}

