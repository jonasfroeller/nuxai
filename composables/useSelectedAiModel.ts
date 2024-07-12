import { shallowRef } from 'vue';
import type { AllowedAiModelPaths, AllowedAiModels } from '~/server/api/ai/types';

export const useSelectedAiModel = () => {
    return useState('selected-model', () => shallowRef<AllowedAiModels>('OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'));
};

export const useSelectedAiModelApiPath = () => {
    const selectedModel = useSelectedAiModel();

    const selectedModelApiPath = computed<AllowedAiModelPaths>(() => {
        return `/api/ai/huggingface/${selectedModel.value}/chat`;
    });

    return selectedModelApiPath;
};
