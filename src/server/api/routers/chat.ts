import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import z from 'zod';
import { createChat } from '~/lib/ai-functions';
import { getPracticeSessionById } from '~/server/api/helpers/practiceSession';

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { chats, practiceSessions } from "~/server/db/schema";
import { type Message } from 'ai';

const ChatOutputSchema = z.object({
    id: z.string(),
    userId: z.string().nullable(),
    name: z.string().nullable(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    messages: z.array(z.custom<Message>()).nullable(),
});

// chat routes
export const chatRouter = createTRPCRouter({

    get: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .output(ChatOutputSchema)
        .query(async ({ ctx, input }) => {
            const chat = await ctx.db.query.chats.findFirst({
                where: eq(chats.id, input.chatId),
            });

            console.log('chat.get -> chat row:', chat);

            if (!chat) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' });
            }

            return {
                ...chat,
                createdAt: chat.createdAt?.toISOString() ?? null,
                updatedAt: chat.updatedAt?.toISOString() ?? null,
                messages: Array.isArray(chat.messages) ? chat.messages : [],
            };
        }),

    create: protectedProcedure
        .input(z.object({ practiceSessionId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            try {
                console.log('trying to make newChat, await createChat');
                const newChatId = await createChat({
                    userId: ctx.user.id,
                    practiceSessionId: input.practiceSessionId,
                })
                console.log('new chat made, newChatId:', newChatId);
                console.log('trying to find practice session');
                const foundPracticeSession = await getPracticeSessionById(ctx, input.practiceSessionId)

                if (!foundPracticeSession) {
                    throw new TRPCError({ code: "UNAUTHORIZED" })
                }
                console.log('found practice session, updating db with chat');
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
                console.log('updated db, returning newchatid to load it');
                return newChatId
            } catch (error) {
                console.error(`[createChat] Error in creating chat inside of trpc mutation:`, error)
                throw error;
            }
        }),

    saveMessages: protectedProcedure
        .input(z.object({
            chatId: z.string(),
            messages: z.array(z.custom<Message>())
        }))
        .mutation(async ({ ctx, input }) => {
            const foundChat = await ctx.db.query.chats.findFirst({
                where: eq(chats.id, input.chatId)
            });

            if (!foundChat || foundChat.userId !== ctx.user.id) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            await ctx.db
                .update(chats)
                .set({
                    messages: input.messages,
                    updatedAt: new Date()
                })
                .where(eq(chats.id, input.chatId));

            return { success: true };
        })
});