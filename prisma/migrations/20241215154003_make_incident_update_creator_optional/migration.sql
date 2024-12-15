-- Add createdById column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'IncidentUpdate' AND column_name = 'createdById'
    ) THEN
        ALTER TABLE "IncidentUpdate" ADD COLUMN "createdById" TEXT;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'IncidentUpdate_createdById_fkey'
    ) THEN
        ALTER TABLE "IncidentUpdate" ADD CONSTRAINT "IncidentUpdate_createdById_fkey" 
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
