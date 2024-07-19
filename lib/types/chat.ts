import type { AllowedAiModels } from "./ai.models"

export type Chat = {
    id: number
    name: string
    model: AllowedAiModels
}

export interface ChatExtended extends Chat {
    created_at: Date | null;
    updated_at: Date | null;
    id: number;
}
