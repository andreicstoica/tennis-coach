import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { createChat } from '~/lib/ai-functions';

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { chats, practiceSessions } from "~/server/db/schema";
import { getPracticeSessionById } from '../helpers/practiceSession';

export const chatRouter = createTRPCRouter({

    get: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            const foundChat = await ctx.db.query.chats.findFirst({
                where: eq(chats.id, input.chatId)
            })

            if (!foundChat || foundChat.userId !== ctx.user.id) {
                throw new TRPCError({ code: "UNAUTHORIZED" })
            }

            return foundChat
        }),

    create: protectedProcedure
        .input(z.object({ practiceSessionId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const newChatId = await createChat({
                userId: ctx.user.id,
                practiceSession: input.practiceSessionId,
            })

            const foundPracticeSession = await getPracticeSessionById(ctx, input.practiceSessionId)

            if (!foundPracticeSession) {
                throw new TRPCError({ code: "UNAUTHORIZED" })
            }

            await ctx.db
            .update(practiceSessions)
            .set({ chatId: newChatId })
            .where(
                and(
                    eq(practiceSessions.id, input.practiceSessionId),
                    eq(practiceSessions.userId, ctx.user.id)
                )
            )
            .execute();

            return newChatId
        })
});