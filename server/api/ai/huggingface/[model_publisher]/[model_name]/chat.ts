import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';
import { experimental_buildOpenAssistantPrompt, experimental_buildLlama2Prompt } from 'ai/prompts';

type ModelConfiguration = {
    configuration: (inputs: string) => {
        inputs: string;
        model: string;
        parameters: {
            max_new_tokens: number;
            typical_p: number;
            repetition_penalty: number;
            truncate: number;
            return_full_text: boolean;
        };
    };
};

type CustomModelConfiguration = {
    configuration: (
        inputs: string,
        model: string,
        max_new_tokens?: number,
        typical_p?: number,
        repetition_penalty?: number,
        truncate?: number,
        return_full_text?: boolean
    ) => {
        model: string;
        inputs: string;
        parameters: {
            max_new_tokens: number;
            typical_p: number;
            repetition_penalty: number;
            truncate: number;
            return_full_text: boolean;
        };
    };
};

// TODO: improve typing, allow custom models
// TODO: allow custom parameters
type PossibleAiModels = {
    [key: string]: {
        [model: string]: ModelConfiguration
    };
};

const possibleAiModels: PossibleAiModels = {
    "OpenAssistant": {
        "oasst-sft-4-pythia-12b-epoch-3.5": {
            configuration: (inputs: string) => {
                return {
                    /* https://huggingface.co/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5 */
                    model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
                    inputs: inputs, // `<|prompter|>${prompt}<|endoftext|><|assistant|>`
                    parameters: {
                        max_new_tokens: 500,
                        typical_p: 0.2, /* higher means, more creative */
                        repetition_penalty: 1.1, /* repetion is less likely because the model receives penalty */
                        truncate: 2046 - 500, /* max_new_tokens of this model is 2046 */
                        return_full_text: false
                    }
                }
            }
        }
    },
    "01-ai": {
        "Yi-1.5-34B-Chat": {
            configuration: (inputs: string) => {
                return {
                    /* https://huggingface.co/01-ai/Yi-1.5-34B-Chat */
                    model: '01-ai/Yi-1.5-34B-Chat',
                    inputs: inputs,
                    parameters: {
                        max_new_tokens: 500,
                        typical_p: 0.2,
                        repetition_penalty: 1.1,
                        truncate: 4094 - 500, /* context length of this model is 32000 */
                        return_full_text: false
                    }
                }
            }
        }
    },
    "mistralai": {
        "Mistral-7B-Instruct-v0.2": { /* mistralai/Mistral-7B-v0.3 is too large */
            configuration: (inputs: string) => {
                return {
                    /* https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2 */
                    model: 'mistralai/Mistral-7B-Instruct-v0.2',
                    inputs: inputs,
                    parameters: {
                        max_new_tokens: 16000,
                        typical_p: 0.2,
                        repetition_penalty: 1.1,
                        truncate: 16000, /* context length of this model is ??? */
                        return_full_text: false
                    }
                }
            }
        }
    }
} as const;

/* 
    "custom": {
        "custom": {
            configuration: (
                inputs: string,
                model: string,
                max_new_tokens?: number,
                typical_p?: number,
                repetition_penalty?: number,
                truncate?: number,
                return_full_text?: boolean
            ) => {
                return {
                    model: model,
                    inputs: inputs,
                    parameters: {
                        max_new_tokens: 500,
                        typical_p: 0.2,
                        repetition_penalty: 1.1,
                        truncate: 1546,
                        return_full_text: false
                    }
                }
            }
        }
    }
*/

/* TODO: make this work for the type AllowedModelPaths, so that everything is dynamic */
const allowedModels = Object.keys(possibleAiModels).flatMap(publisher =>
    Object.keys(possibleAiModels[publisher]).map(model =>
        `${publisher}/${model}`
    )
);

/* TEMPORARY SOLUTION */
const allowedModelsConst = [
    "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5",
    "01-ai/Yi-1.5-34B-Chat",
    "mistralai/Mistral-7B-Instruct-v0.2"
] as const;

export type AllowedModels = `${typeof allowedModelsConst[number]}`;
export type AllowedModelPaths = `/api/ai/huggingface/${typeof allowedModelsConst[number]}/chat`;
/* TEMPORARY SOLUTION */


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
            console.info("allowed models:", allowedModels);
            if (!model_name || !model_publisher || !allowedModels.includes(`${model_publisher}/${model_name}`)) {
                console.warn(`Invalid model name or publisher: ${model_publisher}/${model_name}. Allowed are '${allowedModels.join(", ")}'`);
                sendError(event, createError({ statusCode: 400, statusMessage: 'Invalid model name or publisher' }));
            }

            let inputs = messages;

            if (model_publisher === "OpenAssistant") {
                inputs = experimental_buildOpenAssistantPrompt(messages);
                console.info("using custon prompt builder for OpenAssistant");
            } else {
                console.warn(`Using default prompt builder (buildOpenAssistantPrompt) for: ${model_publisher}/${model_name}`);
                inputs = experimental_buildOpenAssistantPrompt(messages);
            }

            console.log("---");
            console.info("AI request:", inputs);
            console.log("---");

            const response = Hf.textGenerationStream(
                (
                    possibleAiModels?.
                    [model_publisher ?? "OpenAssistant"]?.
                    [model_name ?? "oasst-sft-4-pythia-12b-epoch-3.5"])?.
                    configuration(inputs)
            );

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
