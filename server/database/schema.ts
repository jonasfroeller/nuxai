import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const chat_user = pgTable("chat_user", {
	id: serial("id").primaryKey(),
	primary_email: text("primary_email").notNull().unique(),
	hashed_password: text("hashed_password").notNull()
});

export const chat_history = pgTable("chat_history", {
	id: serial("id").primaryKey(),
	chat_user_id: integer("chat_user_id").notNull().references(() => chat_user.id),
	message: text("message").notNull(),
	actor: text("actor").notNull().default("user"),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow()
})