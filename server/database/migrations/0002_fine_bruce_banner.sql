CREATE TABLE IF NOT EXISTS "chat_conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_conversation_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"actor" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"chat_user_id" integer NOT NULL,
	"chat_conversation_id" integer NOT NULL
);
--> statement-breakpoint
DROP TABLE "chat_history";--> statement-breakpoint
ALTER TABLE "chat_user" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "chat_user" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_message" ADD CONSTRAINT "chat_conversation_message_chat_user_id_chat_user_id_fk" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_message" ADD CONSTRAINT "chat_conversation_message_chat_conversation_id_chat_conversation_id_fk" FOREIGN KEY ("chat_conversation_id") REFERENCES "public"."chat_conversation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
