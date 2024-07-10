CREATE TABLE IF NOT EXISTS "chat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_user_id" integer NOT NULL,
	"message" text NOT NULL,
	"actor" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_chat_user_id_chat_user_id_fk" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
