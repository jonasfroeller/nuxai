import { z } from "zod";

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
