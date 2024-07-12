import type { PossibleAiModels } from "./types";

export const POSSIBLE_AI_MODELS: PossibleAiModels = {
    "OpenAssistant": {
        "oasst-sft-4-pythia-12b-epoch-3.5": {
            publisher: "OpenAssistant",
            name: "oasst-sft-4-pythia-12b-epoch-3.5",
            description: `<strong>OpenAssistant collected data from over 13'000 humans and released it to the public.</strong><br>
            Data, models, and code are publicly available.<br>
            (Apache-2.0 License)`,
            icon: "bxs:dog",
            configuration: (inputs: string) => {
                return {
                    /* https://huggingface.co/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5 */
                    model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
                    inputs: inputs, // `<|prompter|>${prompt}<|endoftext|><|assistant|>`
                    parameters: {
                        max_new_tokens: 500,
                        typical_p: 0.2, /* higher means, more creative */
                        repetition_penalty: 1.1, /* repetition is less likely because the model receives penalty */
                        truncate: 2046 - 500, /* max_new_tokens of this model is 2046 */
                        return_full_text: false
                    }
                }
            }
        }
    },
    "01-ai": {
        "Yi-1.5-34B-Chat": {
            publisher: "01-ai",
            name: "Yi-1.5-34B-Chat",
            description: `<strong>Our vision: Make AGI Accessible and Beneficial to Everyone.</strong><br>
            01.AI vision: AI will effectively enhance human productivity, hence creating significant economic and societal values,
            <br>realizing 01.AI's aspiration of "Human + AI" that technology empowers and amplifies our humankind.
            <br>We hope to be able to contribute to this new AI 2.0 ecosystem.<br>
            (Apache-2.0 License)`,
            icon: "mdi:rabbit",
            configuration: (inputs: string) => {
                return {
                    /* https://huggingface.co/01-ai/Yi-1.5-34B-Chat */
                    model: '01-ai/Yi-1.5-34B-Chat',
                    inputs: inputs,
                    parameters: {
                        max_new_tokens: 500,
                        typical_p: 0.2,
                        repetition_penalty: 1.1,
                        truncate: 4094 - 500, /* context length of this model is 4094 */
                        return_full_text: false
                    }
                }
            }
        }
    },
    "mistralai": {
        "Mistral-7B-Instruct-v0.1": { /* mistralai/Mistral-7B-v0.3 is too large */
            publisher: "mistralai",
            name: "Mistral-7B-Instruct-v0.1",
            description: `<strong>Frontier AI in your hands</strong><br>
            The open-weights models are highly efficient and available under a fully permissive Apache 2 license.<br>
            They are ideal for customization, such as fine-tuning, due to their portability, control, and fast performance.<br>
            (Apache-2.0 License)`,
            icon: "game-icons:hummingbird",
            configuration: (inputs: string) => {
                return {
                    /* https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1 */
                    model: 'mistralai/Mistral-7B-Instruct-v0.1',
                    inputs: inputs,
                    parameters: {
                        max_new_tokens: 500,
                        typical_p: 0.2,
                        repetition_penalty: 1.1,
                        truncate: 8000 - 500, /* context length of this model is 7999 */
                        return_full_text: false
                    }
                }
            }
        }
    }
} as const;

/* TODO: make this work for the type AllowedModelPaths, so that everything is dynamic */
export const ALLOWED_AI_MODELS = Object.keys(POSSIBLE_AI_MODELS).flatMap(publisher =>
    Object.keys(POSSIBLE_AI_MODELS[publisher]).map(model =>
        `${publisher}/${model}`
    )
);
