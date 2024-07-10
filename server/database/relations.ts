import { relations } from "drizzle-orm/relations";
import { chat_user, chat_history } from "./schema";

export const chat_historyRelations = relations(chat_history, ({ one }) => ({
    chat_user: one(chat_user, {
        fields: [chat_history.chat_user_id],
        references: [chat_user.id]
    }),
}));

export const chat_userRelations = relations(chat_user, ({ many }) => ({
    chat_histories: many(chat_history),
}));
