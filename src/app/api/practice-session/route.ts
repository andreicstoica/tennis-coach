import { openai } from '@ai-sdk/openai';
import { appendClientMessage, createIdGenerator, streamText } from 'ai';
import type { Message } from 'ai';
import { getChatMessages } from '~/lib/chat-store'

export const maxDuration = 30;
const prompt = `You are a helpful tennis coach that has already given a practice session plan to the user. 
Help answer any questions they may have, especially clarifications on how to do the drills.`

export async function POST(req: Request) {
    try {
        const { message, id } = await req.json() as { message: Message, id: string }
        
        const previousMessages = await getChatMessages(id);
        if (previousMessages === null) {
            throw new Error('messages are somehow null?');
        }

        const messagesToSendToAi = appendClientMessage({
            messages: previousMessages,
            message,
        })
        

        const result = streamText({
            model: openai('o4-mini'),
            system: prompt,
            messages: messagesToSendToAi,
            experimental_generateMessageId: createIdGenerator({
                prefix: 'msgs',
                size: 16,
            }),
            onError: (error) => console.log(error),

            // TODO add tool usage?
        });

        return result.toDataStreamResponse({
            getErrorMessage: (error) => {
                if (error == null) {
                    return 'unknown error'
                }
                if (typeof error === 'string') {
                    return error;
                }
                if (error instanceof Error) {
                    return JSON.stringify(error)
                }
            },
        })
    } catch (error) {
        console.log('Error in /api/practice-session chat:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
    }
}