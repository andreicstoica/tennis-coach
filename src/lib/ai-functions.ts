import { openai } from "@ai-sdk/openai";
import { generateObject, generateId, type Message } from "ai";
import { db } from "~/server/db";
import { chats } from "~/server/db/schema";
import { practiceSessions } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { PracticePlanSchema } from "./schemas/practice-plan";

export const maxDuration = 10;

export async function createPractice(focus: string): Promise<string> {
  const toolStart = Date.now();
  console.log(
    `[createPractice] Starting practice generation for focus: "${focus}"`,
  );

  const prompt = `You are a world-class tennis coach. Create a structured practice session for two competitive players (NTRP 4.0+) focused on: "${focus}".

Guidelines:
- All activities must be done between exactly two players. Avoid any drills requiring coach feeding, extra players, or ball baskets.
- Equipment should be minimal and common: racquets, balls, cones (or substitutes like water bottles), and court lines.
- "warmup" (~5-10 min): Active and tennis-specific (e.g. dynamic footwork, lateral movement, shadow swings, mini volleys). Avoid jogging laps. Give specific examples of stretches and movements.
- "drill": A cooperative rally-based exercise that directly targets "${focus}". Emphasize technique, timing, and consistency. Use proven formats from elite coaches. Make it fun and engaging for two players to do on their own.
- "game": A 10-20 minute competitive mini-game that builds on the previous drill. Use creative rules, constraints, or scoring tweaks to reinforce "${focus}" in match-like situations. It should be engaging, repeatable, and a fun finish to the session.
- Vary responses when called with the same "${focus}" more than once. Avoid identical outputs on consecutive runs.`;

  console.log(`[createPractice] Calling OpenAI API with structured output...`);
  const apiStart = Date.now();

  const result = await generateObject({
    model: openai("gpt-4.1-mini"),
    system: prompt,
    prompt: `Create a practice session focused on: ${focus}`,
    schema: PracticePlanSchema,
    temperature: 0.7,
  });

  console.log(
    `[createPractice] OpenAI API call completed in ${Date.now() - apiStart}ms`,
  );
  console.log(
    `[createPractice] Total tool execution time: ${Date.now() - toolStart}ms`,
  );
  console.log(`[createPractice] Generated structured object:`, result.object);

  return JSON.stringify(result.object);
}

export async function createChat({
  practiceSessionId,
  userId,
}: {
  practiceSessionId: number;
  userId: string;
}): Promise<string> {
  const id = generateId();
  console.log(`[createChat] Attemping to create new chat with ID: ${id}`);

  const practiceSession = await db.query.practiceSessions.findFirst({
    where: eq(practiceSessions.id, practiceSessionId),
  });

  if (!practiceSession) {
    throw new Error(`Practice session with id ${practiceSessionId} not found`);
  }

  const focus: Message = {
    id: generateId(),
    createdAt: practiceSession.createdAt ?? undefined,
    content: `Make me a practice session focusing on: ${practiceSession.focusArea}`,
    role: "user",
  };

  const initialMessages = [focus];

  try {
    const insertedRows = await db
      .insert(chats)
      .values({
        id: id,
        userId: userId,
        name: `${practiceSession.focusArea} - ${practiceSession.createdAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        messages: initialMessages,
      })
      .returning({ id: chats.id });

    if (insertedRows.length > 0) {
      console.log(`[createChat] Created new chat with ID ${id}`);
      return id;
    } else {
      console.error(
        `[createChat] Insert returned no rows, but no error occured at id: ${id}`,
      );
      throw new Error("Failed to create chat in DB (no rows inserted).");
    }
  } catch (error) {
    console.error(`[createChat] Error in creating chat with ID: ${id}:`, error);
    throw error;
  }
}
