import "server-only";
import WebSocket from "ws";

/**
 * Node 20 has no built-in WebSocket, and supabase-js refuses to start without one.
 * On Node 22+ the native one is used; on older Node we hand it the `ws` package.
 * (Realtime isn't used by the site — this only keeps the client from crashing.)
 */
export const realtimeTransport =
  typeof globalThis.WebSocket === "undefined"
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { transport: WebSocket as any }
    : {};
