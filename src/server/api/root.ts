import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { practiceSessionRouter } from "~/server/api/routers/practice-session";
import { chatRouter } from "./routers/chat";
import { courtBadgesRouter } from "./routers/court-badges";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  practiceSession: practiceSessionRouter,
  chat: chatRouter,
  courtBadges: courtBadgesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
