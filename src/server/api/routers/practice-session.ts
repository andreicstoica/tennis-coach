import { desc, eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { practiceSessions } from "~/server/db/schema";
import { getPracticeSessionById } from "../helpers/practiceSession";

export const practiceSessionRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
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
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await getPracticeSessionById(ctx, input.id);
    }),

  create: protectedProcedure
    .input(z.object({ focus: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { focus } = input;

      const newPracticeSession = ctx.db
        .insert(practiceSessions)
        .values({
          focusArea: focus,
          userId: ctx.user.id,
        })
        .returning()
        .execute();

      return newPracticeSession;
    }),
});
