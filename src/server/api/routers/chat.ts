import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import z from 'zod';
import { createChat } from '~/lib/ai-functions';
import { getPracticeSessionById } from '~/server/api/helpers/practiceSession';

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { chats, practiceSessions } from "~/server/db/schema";
import { type Message } from 'ai';

// chat routes
export const chatRouter = createTRPCRouter({

    get: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .output(z.object({
            id: z.string(),
            userId: z.string(),
            name: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
            messages: z.array(z.custom<Message>())
        }))
        .query(async ({ ctx, input }) => {
            const chatId = input.chatId;
            console.log('chat.get input:', input);
            if (!chatId) throw new TRPCError({ code: "BAD_REQUEST", message: "chatId required" });
            try {
                const foundChat = await ctx.db.query.chats.findFirst({
                    where: eq(chats.id, chatId)
                });

                if (!foundChat) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });
                }

                // fix types: convert dates to ISO string, nulls to empty string, messages to array
                return {
                    id: foundChat.id,
                    userId: foundChat.userId ?? "",
                    name: foundChat.name ?? "",
                    createdAt: foundChat.createdAt ? foundChat.createdAt.toISOString() : "",
                    updatedAt: foundChat.updatedAt ? foundChat.updatedAt.toISOString() : "",
                    messages: Array.isArray(foundChat.messages) ? foundChat.messages : [],
                }
            } catch (e) {
                console.error('chat.get error:', e);
                throw e;
            }
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