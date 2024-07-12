import { shallowRef } from 'vue';
import type { AllowedAiModels, AllowedAiModelPaths } from '~/lib/types/ai.models';

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
