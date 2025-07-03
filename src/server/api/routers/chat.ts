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
    userId: z.string(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    messages: z.array(z.custom<Message>()).nullable(),
});

export const chatRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .output(ChatOutputSchema)
        .query(async ({ ctx, input }) => {
            const chat = await ctx.db.query.chats.findFirst({
                where: eq(chats.id, input.chatId),
                columns: {
                    id: true,
                    userId: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                    messages: true,
                }
            });

            console.log('chat.get -> DB result:', chat);

            if (!chat) {
                console.log('chat.get -> throwing NOT_FOUND');
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' });
            }

            // check if createdAt is defined
            if (!chat.createdAt) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Chat missing createdAt' });
            }

            // userId must be string, not null
            if (!chat.userId) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Chat missing userId' });
            }

            // messages must be Message[] or null
            let messages: Message[] | null = null;
            if (Array.isArray(chat.messages)) {
                messages = chat.messages as Message[];
            } else if (chat.messages === null || chat.messages === undefined) {
                messages = null;
            } else {
                // If messages is not an array or null, treat as error
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Chat messages malformed' });
            }

            console.log('chat.get -> returning chat');
            return {
                id: chat.id,
                userId: chat.userId,
                name: chat.name,
                createdAt: chat.createdAt.toISOString(),
                updatedAt: chat.updatedAt ? chat.updatedAt.toISOString() : null,
                messages,
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