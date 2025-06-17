import { openai } from '@ai-sdk/openai';
import { generateText, generateId, type Message } from 'ai';
import { db } from '~/server/db';
import { chats } from "~/server/db/schema"
import { type practiceSessions } from '~/server/db/schema';

type PracticeSession = typeof practiceSessions.$inferSelect

export const maxDuration = 10;

export async function createPractice(focus: string): Promise<string> {
    const prompt = `
    You are a tennis coach.  Create a single practice session focused on "${focus}".
    Return **strictly** valid JSON with three keys: "warmup", "drill", and "game", each
    mapping to a short paragraph describing that part of the session.
    Example:
    {"warmup":"…","drill":"…","game":"…"}`.trim();

    const result = await generateText({
        model: openai('gpt-4.5-preview'),
        prompt: prompt,
        temperature: .75,
    })

    return result.text
}

export async function createChat({ practiceSession, userId }: {practiceSession: PracticeSession; userId: string}): Promise<string> {
    const id = generateId();
    console.log(`[createChat] Attemping to create new chat with ID: ${id}`);

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
        const instertedRows = await db.insert(chats).values({
            id: id,
            userId: userId,
            name: `${practiceSession.focusArea} - ${practiceSession.createdAt?.getDate()}`,
            messages: initialMessages,
        }).returning({ id: chats.id })

        if (instertedRows.length > 0) {
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


