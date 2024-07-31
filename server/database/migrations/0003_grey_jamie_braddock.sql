ALTER TABLE "chat_conversation_file" ADD COLUMN "chat_conversation_message_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_file" ADD CONSTRAINT "chat_conversation_file_chat_conversation_message_id_chat_conversation_message_id_fk" FOREIGN KEY ("chat_conversation_message_id") REFERENCES "public"."chat_conversation_message"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
