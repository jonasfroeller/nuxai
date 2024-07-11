import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().huggingfaceApiKey;
    if (!apiKey) throw new Error('Missing OpenAI API key');

    const Hf = new HfInference(apiKey);

    return defineEventHandler(async (event: any) => {
        const { messages } = await readBody(event); // complete chat history

        console.log("AI conversation:", messages);
        const parsedAiConversation = JSON.parse(JSON.stringify(messages));
        console.log("parsedAiConversation:", parsedAiConversation);
        const prompt = parsedAiConversation[parsedAiConversation.length - 1]?.content;
        console.log("prompt:", prompt);

        try {
            const response = Hf.textGenerationStream({
                model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
                inputs: `<|prompter|>${prompt}<|endoftext|><|assistant|>`,
                parameters: {
                    max_new_tokens: 200,
                    typical_p: 0.2,
                    repetition_penalty: 1,
                    truncate: 1000,
                    return_full_text: false
                }
            });

            // Convert the response into a friendly text-stream
            const stream = HuggingFaceStream(response);

            // Respond with the stream
            return new StreamingTextResponse(stream);
        } catch (error) {
            console.error("AI request errored:", error);
            sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }));
        }
    });
});
