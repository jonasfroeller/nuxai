import { AllowedAiModelsEnum } from "~/lib/types/ai.models";
import { z } from "zod";

/* ROUTE PARAMETERS */

const primaryIdSchema = z.number().positive().int();

export const UserIdSchema = z.object({
    user_id: primaryIdSchema
})

export const ChatIdSchema = z.object({
    chat_id: primaryIdSchema
})

export const ChatMessageIdSchema = z.object({
    message_id: primaryIdSchema
})

/* BODY */

const allowedAiModelsValues = Object.values(AllowedAiModelsEnum) as [string, ...string[]];
export const ChatConversationToCreateSchema = z.object({
    model: z.enum(allowedAiModelsValues),
    name: z.string().min(3)
})
