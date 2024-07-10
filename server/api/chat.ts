import { StreamingTextResponse, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().openaiApiKey;
    if (!apiKey) throw new Error('Missing OpenAI API key');

    const openai = createOpenAI({
        apiKey: apiKey,
    });

    return defineEventHandler(async (event: any) => {
        const { messages } = await readBody(event); // complete chat history

        try {
            const result = await streamText({ // stream response
                model: openai('gpt-3.5-turbo'),
                messages,
            });

            return new StreamingTextResponse(result.toAIStream()); // display stream response
        } catch (error) {
            console.error("AI request errored:", error);
            sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }));
        }
    });
});
