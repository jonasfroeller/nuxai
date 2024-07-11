import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const chat_user = pgTable("chat_user", {
	id: serial("id").primaryKey(),
	primary_email: text("primary_email").notNull().unique(),
	hashed_password: text("hashed_password").notNull(),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

export const chat_conversation = pgTable("chat_conversation", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	model: text("model").notNull(),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
})

export const chat_conversation_message = pgTable("chat_conversation_message", {
	id: serial("id").primaryKey(),
	message: text("message").notNull(),
	actor: text("actor").notNull().default("user"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),

	chat_user_id: integer("chat_user_id").notNull().references(() => chat_user.id),
	chat_conversation_id: integer("chat_conversation_id").notNull().references(() => chat_conversation.id),
})
