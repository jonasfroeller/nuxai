import { pgTable, unique, serial, text, foreignKey, integer, timestamp } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const chat_user = pgTable("chat_user", {
	id: serial("id").primaryKey().notNull(),
	primary_email: text("primary_email").notNull(),
	hashed_password: text("hashed_password").notNull(),
},
(table) => {
	return {
		chat_user_primary_email_key: unique("chat_user_primary_email_key").on(table.primary_email),
	}
});

export const chat_history = pgTable("chat_history", {
	id: serial("id").primaryKey().notNull(),
	chat_user_id: integer("chat_user_id").notNull().references(() => chat_user.id),
	message: text("message").notNull(),
	actor: text("actor").default('user').notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});