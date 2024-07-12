import { shallowRef } from 'vue';
import type { AllowedModelPaths, AllowedModels } from '~/server/api/ai/huggingface/[model_publisher]/[model_name]/chat';

export const useSelectedModel = () => {
    return useState('selected-model', () => shallowRef<AllowedModels>('OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'));
};

export const useSelectedModelApiPath = () => {
    const selectedModel = useSelectedModel();

    const selectedModelApiPath = computed<AllowedModelPaths>(() => {
        return `/api/ai/huggingface/${selectedModel.value}/chat`;
    });

    return selectedModelApiPath;
};
