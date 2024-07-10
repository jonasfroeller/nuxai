CREATE TABLE IF NOT EXISTS "chat_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"primary_email" text NOT NULL,
	"hashed_password" text NOT NULL,
	CONSTRAINT "chat_user_primary_email_unique" UNIQUE("primary_email")
);
