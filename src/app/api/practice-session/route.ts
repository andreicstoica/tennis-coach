import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import type { Message } from "ai";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { chats } from "~/server/db/schema";

export const maxDuration = 30;

const prompt = `You are a helpful tennis coach that has already given a practice session plan to the user.
Help answer any questions they may have, especially clarifications on how to do the drills.
Be encouraging, specific, and provide practical advice. Keep responses concise but helpful.
Assume they are at a generally high level, unless they say otherwise.`;

export async function POST(req: Request) {
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

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: prompt,
      messages: convertToCoreMessages(allMessages),
      onFinish: async (result) => {
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
