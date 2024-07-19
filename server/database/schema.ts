import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

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
