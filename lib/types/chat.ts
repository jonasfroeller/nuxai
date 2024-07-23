import type { AllowedAiModels } from './ai.models';

export type MinimalChat = {
  id: number;
  name: string;
  model: AllowedAiModels;
};

export interface FullyFeaturedChat extends MinimalChat {
  created_at: Date | null;
  updated_at: Date | null;
  chat_user_id: number;
}
