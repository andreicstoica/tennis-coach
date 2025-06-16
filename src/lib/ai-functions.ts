import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 10;

export default async function createPractice(focus: string): Promise<string> {

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
        // tools: {
        //     getPracticeSession :{
        //         description: 'generate a practice session for our tennis player!',
        //         parameters: z.object({ focus: z.string() }),
        //         execute: async ({}: { focus: string }) => {
        //             const 
        //         }
        //     }
        // }
    })

    return result.text
}


