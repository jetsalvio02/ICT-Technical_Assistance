CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facebook_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "districts" ADD COLUMN "type" text DEFAULT 'District' NOT NULL;--> statement-breakpoint
ALTER TABLE "findings" ADD COLUMN "recommendation_description" text;--> statement-breakpoint
ALTER TABLE "offices" ADD COLUMN "type" text DEFAULT 'Office' NOT NULL;