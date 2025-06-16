import { TRPCError } from '@trpc/server';
import { desc, eq } from 'drizzle-orm';
import z from 'zod';
import createPractice from '~/lib/ai-functions';

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
      orderBy: [desc(practiceSessions.createdAt)],
    });
    return foundPracticeSessions ?? null;
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() })) // might cause issues, it is a number in the db so set input to so
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
    .input(z.object({ focus: z.string() }))
    .mutation(async ({ ctx, input }) => {

      const { focus } = input
      const plan = await createPractice(focus)

      const newPracticeSession = ctx.db
        .insert(practiceSessions)
        .values({
          focusArea: focus,
          userId: ctx.user.id,
          plan: plan
        })
        .returning()
        .execute()

      return newPracticeSession
    })
});