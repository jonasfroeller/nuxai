DO $$ BEGIN
 CREATE TYPE "public"."ai_model_enum" AS ENUM('OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', 'mistralai/Mistral-7B-Instruct-v0.1');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."chat_conversation_message_actor_enum" AS ENUM('user', 'assistant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "chat_conversation" ALTER COLUMN "model" SET DATA TYPE ai_model_enum;--> statement-breakpoint
ALTER TABLE "chat_conversation_message" ALTER COLUMN "actor" SET DATA TYPE chat_conversation_message_actor_enum;