CREATE TABLE "court-badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"court_badges" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "court-badges_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "court-badges" ADD CONSTRAINT "court-badges_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;