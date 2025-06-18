import { openai } from '@ai-sdk/openai';
import { generateText, generateId, type Message } from 'ai';
import { db } from '~/server/db';
import { chats } from "~/server/db/schema"
import { practiceSessions } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export const maxDuration = 10;

export async function createPractice(focus: string): Promise<string> {

    const prompt = `
        You are a world-class tennis coach. Create a structured practice session for two competitive players (NTRP 4.0+) focused on: "${focus}".

        Return **strictly valid JSON** with exactly three keys: "warmup", "drill", and "game". Each maps to a short paragraph (2-5 sentences) describing that part of the session.

        Guidelines:
        - All activities must be done between exactly two players. Avoid any drills requiring coach feeding, extra players, or ball baskets.
        - Equipment should be minimal and common: racquets, balls, cones (or substitutes like water bottles), and court lines.
        - "warmup" (~5-10 min): Active and tennis-specific (e.g. dynamic footwork, lateral movement, shadow swings, mini volleys). Avoid jogging laps.
        - "drill": A cooperative or semi-competitive rally-based exercise that directly targets "${focus}". Emphasize technique, timing, and consistency. Use proven formats from elite coaches (e.g. YouTube, Reddit, or classic coaching books).
        - "game": A 10to20 minute competitive mini-game that builds on the drill. Use creative rules, constraints, or scoring tweaks to reinforce "${focus}" in match-like situations. It should be engaging, repeatable, and fun.
        - Vary responses when called with the same "${focus}" more than once. Avoid identical outputs on consecutive runs.

        Output only valid JSON, like:
        {"warmup":"...","drill":"...","game":"..."}
    `.trim();

    const result = await generateText({
        model: openai('gpt-4.5-preview'),
        prompt: prompt,
        temperature: .75,
    })

    return result.text
}

export async function createChat({ practiceSessionId, userId }: {practiceSessionId: number; userId: string}): Promise<string> {
    const id = generateId();
    console.log(`[createChat] Attemping to create new chat with ID: ${id}`);

    const practiceSession = await db.query.practiceSessions.findFirst({
        where: eq(practiceSessions.id, practiceSessionId)
    });

    if (!practiceSession) {
        throw new Error(`Practice session with id ${practiceSessionId} not found`);
    }

    const focus: Message = {
        id: generateId(),
        createdAt: practiceSession.createdAt ?? undefined,
        content: practiceSession.focusArea,
        role: 'user',
    }

    const practice: Message = {
        id: generateId(),
        createdAt: practiceSession.createdAt ?? undefined,  
        content: practiceSession.plan,
        role: 'assistant'
    }

    const initialMessages = [focus, practice]

    try {
        const insertedRows = await db.insert(chats).values({
            id: id,
            userId: userId,
            name: `${practiceSession.focusArea} - ${practiceSession.createdAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            messages: initialMessages,
        }).returning({ id: chats.id })

        if (insertedRows.length > 0) {
            console.log(`[createChat] Created new chat with ID: ${id}`);
            return id;
        } else {
            console.error(`[createChat] Insert returned no rows, but no error occured at id: ${id}`)
            throw new Error('Failed to create chat in DB (no rows inserted).')
        }
    } catch (error) {
        console.error(`[createChat] Error in creating chat with ID: ${id}:`, error)
        throw error;
    }
}


