import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export type NewUser = typeof chat_user.$inferInsert;
export type GetUser = typeof chat_user.$inferSelect;

export interface UserToCreate extends Omit<NewUser, 'id' | 'hashed_password'> {
  password: string;
}
export type ReadUser = Omit<GetUser, 'hashed_password'>;

export const chat_user = pgTable('chat_user', {
  id: serial('id').primaryKey(),
  primary_email: text('primary_email')
    .notNull()
    .unique() /* the email of the first oauth provider, if only oauth login is used */,
  hashed_password:
    text('hashed_password') /* null, if only oauth login is used */,
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type NewOauthAccount = typeof chat_user_oauth_account.$inferInsert;
export type GetOauthAccount = typeof chat_user_oauth_account.$inferSelect;

export interface OauthAccountToCreate
  extends Omit<
    NewOauthAccount,
    'id' | 'created_at' | 'updated_at' | 'chat_user_id'
  > {
  chat_user_id?: number /* so that a oauth account can be linked to an existing user */;
}
export type ReadOauthAccount = Omit<
  GetOauthAccount,
  /* "id" | "chat_user_id" | */ 'provider' | 'created_at' | 'updated_at'
>;

export const POSSIBLE_OAUTH_PROVIDERS = pgEnum('oauth_provider_enum', [
  'github',
  'google',
]);
export const chat_user_oauth_account = pgTable('chat_user_oauth_account', {
  id: serial('id').primaryKey(),
  provider: POSSIBLE_OAUTH_PROVIDERS('provider').notNull(),
  oauth_user_id: text('oauth_user_id').notNull(),
  oauth_email: text('oauth_email').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_user_id: integer('chat_user_id')
    .notNull()
    .references(() => chat_user.id, { onDelete: 'cascade' }),
});

export type NewChatConversation = typeof chat_conversation.$inferInsert;
export type GetChatConversation = typeof chat_conversation.$inferSelect;

export interface ChatConversationToCreate
  extends Omit<NewChatConversation, 'id' | 'created_at' | 'updated_at'> {}
export type ReadChatConversation = GetChatConversation;

export const chat_conversation = pgTable('chat_conversation', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  model: text('model').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_user_id: integer('chat_user_id')
    .notNull()
    .references(() => chat_user.id, { onDelete: 'cascade' }),
});

export type NewChatConversationMessage =
  typeof chat_conversation_message.$inferInsert;
export type GetChatConversationMessage =
  typeof chat_conversation_message.$inferSelect;

export interface ChatConversationMessageToCreate
  extends Omit<
    NewChatConversationMessage,
    'id' | 'created_at' | 'updated_at'
  > {}
export type ReadChatConversationMessage = GetChatConversationMessage;

export const chat_conversation_message = pgTable('chat_conversation_message', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  actor: text('actor').notNull().default('user'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_user_id: integer('chat_user_id')
    .notNull()
    .references(() => chat_user.id, { onDelete: 'cascade' }),
  chat_conversation_id: integer('chat_conversation_id')
    .notNull()
    .references(() => chat_conversation.id, { onDelete: 'cascade' }),
});

export const chat_conversation_file = pgTable('chat_conversation_file', {
  id: serial('id').primaryKey(),
  title: text('title'),
  language: text('language').default('text').notNull(),
  extension: text('file_extension').default('txt').notNull(),
  text: text('text').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  chat_user_id: integer('chat_user_id')
    .notNull()
    .references(() => chat_user.id, { onDelete: 'cascade' }),
  chat_conversation_id: integer('chat_conversation_id')
    .notNull()
    .references(() => chat_conversation.id, { onDelete: 'cascade' }),
  chat_conversation_message_id: integer('chat_conversation_message_id')
    .notNull()
    .references(() => chat_conversation_message.id, { onDelete: 'cascade' }),
});

export type NewChatConversationFile =
  typeof chat_conversation_file.$inferInsert;
export type GetChatConversationFile =
  typeof chat_conversation_file.$inferSelect;

export interface ChatConversationFileToCreate
  extends Omit<NewChatConversationFile, 'id' | 'created_at' | 'updated_at'> {}
export type ReadChatConversationFile = GetChatConversationFile;

const InsertFileSchemaBase = createInsertSchema(chat_conversation_file);
export const InsertFileSchema = InsertFileSchemaBase.pick({
  title: true,
  language: true,
  extension: true,
  text: true,
}); // chat_user_id: true, chat_conversation_id: true, chat_conversation_message_id: true
export const InsertFileUniversalSchema = z
  .object({ files: z.array(InsertFileSchema) })
  .or(InsertFileSchema); // files: [] could be shortened to []
export const SelectFileSchema = createSelectSchema(chat_conversation_file);
