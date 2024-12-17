-- Add emoji column to Note table
ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "emoji" TEXT DEFAULT '📝';
