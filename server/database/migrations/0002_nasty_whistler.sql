CREATE TABLE IF NOT EXISTS "chat_conversation_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"language" text DEFAULT 'text' NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"chat_user_id" integer NOT NULL,
	"chat_conversation_id" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_file" ADD CONSTRAINT "chat_conversation_file_chat_user_id_chat_user_id_fk" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_file" ADD CONSTRAINT "chat_conversation_file_chat_conversation_id_chat_conversation_id_fk" FOREIGN KEY ("chat_conversation_id") REFERENCES "public"."chat_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
