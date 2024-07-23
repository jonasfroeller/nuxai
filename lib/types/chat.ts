// import type { Message } from 'ai';
import type { AllowedAiModels } from './ai.models';

export type MinimalChat = {
  id: number;
  name: string;
  model: AllowedAiModels;
  // messages?: any[]; // Message[] causes "Type instantiation is excessively deep and possibly infinite.ts-plugin(2589)"
};

export interface FullyFeaturedChat extends MinimalChat {
  created_at: Date | null;
  updated_at: Date | null;
  chat_user_id: number;
}
