import { TRPCError } from '@trpc/server';
import { desc, eq } from 'drizzle-orm';
import z from 'zod';
//import { createChat } from '~/lib/session-store';
//TODO
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { practiceSessions } from "~/server/db/schema";

export const practiceSessionRouter = createTRPCRouter({

  list: protectedProcedure
    .query(async ({ ctx } ) => {
    // getting user session
    const userId = ctx.user.id;

    // find user practice sessions history in db
    const foundPracticeSessions = await ctx.db.query.practiceSessions.findMany({
      where: eq(practiceSessions.userId, userId),
      orderBy: [desc(practiceSessionRouter.createdAt)],
    });
    return foundPracticeSessions ?? null;
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {

      const foundPracticeSession = await ctx.db.query.practiceSessions.findFirst({
        where: eq(practiceSessions.id, input.id)
      })

      if (!foundPracticeSession || foundPracticeSession.userId !== ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      return foundPracticeSession
    }),

  create: protectedProcedure
    .mutation(async ({ ctx }) => {
      const newPracticeSessionId = await createPracticeSession({
        userId: ctx.user.id,
      })

      return newPracticeSessionId
    })
});