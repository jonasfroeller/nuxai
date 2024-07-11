import { pgTable, unique, serial, text, timestamp, foreignKey, integer } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const chat_user = pgTable("chat_user", {
	id: serial("id").primaryKey().notNull(),
	primary_email: text("primary_email").notNull(),
	hashed_password: text("hashed_password").notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		chat_user_primary_email_key: unique("chat_user_primary_email_key").on(table.primary_email),
	}
});

export const chat_conversation_message = pgTable("chat_conversation_message", {
	id: serial("id").primaryKey().notNull(),
	message: text("message").notNull(),
	actor: text("actor").default('user').notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	chat_user_id: integer("chat_user_id").notNull().references(() => chat_user.id),
	chat_conversation_id: integer("chat_conversation_id").notNull().references(() => chat_conversation.id),
});

export const chat_conversation = pgTable("chat_conversation", {
	id: serial("id").primaryKey().notNull(),
	name: text("name").notNull(),
	model: text("model").notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});