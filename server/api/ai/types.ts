import { POSSIBLE_AI_MODELS, ALLOWED_AI_MODELS } from "./ai.models";
export { POSSIBLE_AI_MODELS, ALLOWED_AI_MODELS }

type ModelConfiguration = {
    publisher: string;
    name: string;
    description: string;
    icon: string;
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
export type PossibleAiModels = {
    [key: string]: {
        [model: string]: ModelConfiguration
    };
};

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

/* TEMPORARY SOLUTION */
const allowedModelsConst = [
    "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5",
    "01-ai/Yi-1.5-34B-Chat",
    "mistralai/Mistral-7B-Instruct-v0.1"
] as const;

export type AllowedAiModels = `${typeof allowedModelsConst[number]}`;
export type AllowedAiModelPaths = `/api/ai/huggingface/${typeof allowedModelsConst[number]}/chat`;
/* TEMPORARY SOLUTION */
