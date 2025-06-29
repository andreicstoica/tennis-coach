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
  try {
    const { messages, id } = (await req.json()) as {
      messages: Message[];
      id: string;
    };

    // Get existing chat from database
    const existingChat = await db.query.chats.findFirst({
      where: eq(chats.id, id),
    });

    if (!existingChat) {
      throw new Error("Chat not found");
    }

    // Combine existing messages with new ones
    const allMessages = [...(existingChat.messages ?? []), ...messages];

    // Find the practice session linked to this chat
    const practiceSession = await db.query.practiceSessions.findFirst({
      where: eq(practiceSessions.chatId, id),
    });

    if (!practiceSession) {
      console.error(`[API Route] No practice session found for chatId: ${id}`);
      return new Response(
        JSON.stringify({
          error: "Practice session not linked to this chat. Cannot save plan.",
        }),
        { status: 404 },
      );
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: prompt,
      messages: convertToCoreMessages(allMessages),
      maxSteps: 5,
      tools: {
        createPractice: tools.practiceTool,
      },
      onFinish: async (result) => {
        // Check if createPractice tool was called and save the plan
        // Look for tool result in the response messages
        const toolResultMessage = result.response.messages.find(
          (msg) => msg.role === "tool"
        );

        if (toolResultMessage && toolResultMessage.content) {
          try {
            // Convert the tool result content to a string for database storage
            const planContent = JSON.stringify(toolResultMessage.content);

            // Save the practice plan to the database using tRPC procedure
            await api.practiceSession.addPlan({
              practiceSessionId: practiceSession.id,
              plan: planContent,
            });

            console.log(`[API Route] Saved practice plan to session ${practiceSession.id}`);
          } catch (error) {
            console.error("[API Route] Failed to save practice plan:", error);
          }
        }

        // Save updated messages back to database onFinish
        const updatedMessages = [
          ...allMessages,
          {
            id: result.response.id,
            role: "assistant" as const,
            content: result.text,
            createdAt: result.response.timestamp,
          },
        ];

        await db
          .update(chats)
          .set({
            messages: updatedMessages,
            updatedAt: new Date(),
          })
          .where(eq(chats.id, id));
      },
      onError: (error) => console.error("AI streaming error:", error),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in /api/practice-session chat:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
