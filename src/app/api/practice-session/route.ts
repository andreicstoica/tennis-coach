import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import type { Message } from "ai";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { chats, practiceSessions } from "~/server/db/schema";
import { tools } from "~/lib/ai-tools";
import { api } from "~/trpc/server";

export const maxDuration = 30;

const prompt = `You are a helpful tennis coach that has already given a practice session plan to the user.
Help answer any questions they may have, especially clarifications on how to do the drills.
Be encouraging, specific, and provide practical advice. Keep responses concise but helpful.
Assume they are at a generally high level, unless they say otherwise.`;

export async function POST(req: Request): Promise<Response> {
  const startTime = Date.now();
  console.log(`[API Route] ${new Date().toISOString()} - Request started`);

  try {
    const parseStart = Date.now();
    const { messages, id } = (await req.json()) as {
      messages: Message[];
      id: string;
    };
    console.log(`[API Route] Request parsed in ${Date.now() - parseStart}ms`);
    console.log(
      `[API Route] Chat ID: ${id}, Messages count: ${messages.length}`,
    );

    // Get existing chat from database
    const dbStart = Date.now();
    const existingChat = await db.query.chats.findFirst({
      where: eq(chats.id, id),
    });
    console.log(`[API Route] Chat query took ${Date.now() - dbStart}ms`);

    if (!existingChat) {
      throw new Error("Chat not found");
    }

    // Combine existing messages with new ones, avoiding duplicates
    const existingMessages = existingChat.messages ?? [];
    const messageMap = new Map();

    // Add existing messages to map
    existingMessages.forEach((msg) => messageMap.set(msg.id, msg));

    // Add new messages to map (will overwrite if same ID)
    messages.forEach((msg) => messageMap.set(msg.id, msg));

    const allMessages = Array.from(messageMap.values());
    console.log(`[API Route] Total messages to process: ${allMessages.length}`);

    // Find the practice session linked to this chat
    const sessionStart = Date.now();
    const practiceSession = await db.query.practiceSessions.findFirst({
      where: eq(practiceSessions.chatId, id),
    });
    console.log(
      `[API Route] Practice session query took ${Date.now() - sessionStart}ms`,
    );

    if (!practiceSession) {
      console.error(`[API Route] No practice session found for chatId: ${id}`);
      return new Response(
        JSON.stringify({
          error: "Practice session not linked to this chat. Cannot save plan.",
        }),
        { status: 404 },
      );
    }

    console.log(
      `[API Route] Starting AI generation at ${Date.now() - startTime}ms`,
    );

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: prompt,
      messages: convertToCoreMessages(allMessages as Message[]),
      maxSteps: 5,
      tools: {
        createPractice: tools.practiceTool,
      },
      onFinish: async (result) => {
        const finishTime = Date.now();
        console.log(
          `[API Route] onFinish called at ${finishTime - startTime}ms total`,
        );
        console.log(
          `[API Route] AI generation completed, processing results...`,
        );

        // 1. SAVE PRACTICE PLAN
        const toolStart = Date.now();
        const toolResultMessage = result.response.messages.find(
          (msg) => msg.role === "tool",
        );

        if (toolResultMessage?.content) {
          try {
            console.log(
              `[API Route] Found tool result, saving practice plan...`,
            );

            // Extract the practice plan from the tool result
            const toolResult = toolResultMessage.content;
            const actualResult = Array.isArray(toolResult)
              ? toolResult[0]
              : toolResult;
            const practiceContent = actualResult?.result ?? actualResult;

            // Convert to JSON string for storage
            const practiceData =
              typeof practiceContent === "string"
                ? practiceContent
                : JSON.stringify(practiceContent);

            // Save the practice plan as JSON string
            await api.practiceSession.addPlan({
              practiceSessionId: practiceSession.id,
              plan: practiceData,
            });

            console.log(
              `[API Route] Practice plan saved in ${Date.now() - toolStart}ms`,
            );
          } catch (error) {
            console.error("[API Route] Failed to save practice plan:", error);
          }
        } else {
          console.log(`[API Route] No tool result found in response`);
        }

        // 2. SAVE MESSAGES
        const messageStart = Date.now();
        const updatedMessages = [
          ...(allMessages as Message[]),
          {
            id: result.response.id,
            role: "assistant" as const,
            content: result.text,
            createdAt: result.response.timestamp,
          },
        ] as Message[];

        await db
          .update(chats)
          .set({
            messages: updatedMessages,
            updatedAt: new Date(),
          })
          .where(eq(chats.id, id));

        console.log(
          `[API Route] Messages saved in ${Date.now() - messageStart}ms`,
        );
        console.log(
          `[API Route] Total request time: ${Date.now() - startTime}ms`,
        );
      },
      onError: (error) => console.error("AI streaming error:", error),
    });

    console.log(
      `[API Route] Returning stream response at ${Date.now() - startTime}ms`,
    );
    return result.toDataStreamResponse();
  } catch (error) {
    console.error(
      `[API Route] Error after ${Date.now() - startTime}ms:`,
      error,
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
