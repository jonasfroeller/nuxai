import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';
import { experimental_buildOpenAssistantPrompt, experimental_buildLlama2Prompt } from 'ai/prompts';
import { ALLOWED_AI_MODELS, POSSIBLE_AI_MODELS } from '~/lib/types/ai.models';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().huggingfaceApiKey;
    if (!apiKey) throw new Error('Missing OpenAI API key');
    const Hf = new HfInference(apiKey);

    return defineEventHandler(async (event: any) => {
        const model_name = getRouterParam(event, 'model_name');
        const model_publisher = getRouterParam(event, 'model_publisher');
        console.info(`Fetching model: ${model_publisher}/${model_name}...`);
        const { messages } = await readBody(event); // complete chat history

        try {
            console.info("allowed models:", ALLOWED_AI_MODELS);
            if (!model_name || !model_publisher || !ALLOWED_AI_MODELS.includes(`${model_publisher}/${model_name}`)) {
                console.warn(`Invalid model name or publisher: ${model_publisher}/${model_name}. Allowed are '${ALLOWED_AI_MODELS.join(", ")}'`);
                sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid model name or publisher' }));
            }

            let inputs = messages;
            if (model_publisher === "OpenAssistant") {
                inputs = experimental_buildOpenAssistantPrompt(messages);
                console.info("using custom prompt builder for OpenAssistant");
            } else if (model_name === "mistralai" || model_name === "meta-llama") {
                inputs = experimental_buildLlama2Prompt(messages);
                console.info("using custom prompt builder for Llama2");
            } else {
                console.warn(`Using default prompt builder (buildOpenAssistantPrompt) for: ${model_publisher}/${model_name}`);
                inputs = experimental_buildOpenAssistantPrompt(messages);
            }

            console.log("---");
            console.info("AI request:", inputs);
            console.log("---");

            const response = Hf.textGenerationStream(
                (
                    POSSIBLE_AI_MODELS?.
                    [model_publisher ?? "OpenAssistant"]?.
                    [model_name ?? "oasst-sft-4-pythia-12b-epoch-3.5"])?.
                    configuration(inputs)
            );

            const stream = HuggingFaceStream(response); // Convert the response into a friendly text-stream
            return new StreamingTextResponse(stream); // Respond with the stream
        } catch (error) {
            console.error("AI request errored:", error);
            sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }));
        }
    });
});
