import { pgTable, serial, text } from "drizzle-orm/pg-core"

export const chat_user = pgTable("chat_user", {
	id: serial("id").primaryKey(),
	email: text("email").notNull().unique(),
});
