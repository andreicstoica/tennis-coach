ALTER TABLE "practice-sessions" ALTER COLUMN "plan" SET DATA TYPE jsonb USING CASE WHEN "plan" IS NULL THEN NULL ELSE "plan"::jsonb END;--> statement-breakpoint
ALTER TABLE "practice-sessions" ADD COLUMN "plan_text" text;
