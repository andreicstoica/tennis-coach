CREATE TABLE "chats" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" varchar(256) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone,
	"messages" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;