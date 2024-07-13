DO $$ BEGIN
 CREATE TYPE "public"."oauth_provider_enum" AS ENUM('github', 'google');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_user_oauth_account" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" "oauth_provider_enum" NOT NULL,
	"oauth_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"chat_user_id" integer NOT NULL,
	CONSTRAINT "chat_user_oauth_account_oauth_user_id_unique" UNIQUE("oauth_user_id")
);
--> statement-breakpoint
ALTER TABLE "chat_user" ALTER COLUMN "hashed_password" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_user_oauth_account" ADD CONSTRAINT "chat_user_oauth_account_chat_user_id_chat_user_id_fk" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
