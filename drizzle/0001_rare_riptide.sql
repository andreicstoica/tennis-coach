ALTER TABLE "reflections" RENAME TO "practice-reflections";--> statement-breakpoint
ALTER TABLE "practice-reflections" DROP CONSTRAINT "reflections_session_id_practice-sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "practice-reflections" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "practice-reflections" ADD CONSTRAINT "practice-reflections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice-reflections" ADD CONSTRAINT "practice-reflections_session_id_practice-sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice-sessions"("id") ON DELETE no action ON UPDATE no action;