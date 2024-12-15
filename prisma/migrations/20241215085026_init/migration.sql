-- Check if ServiceStatus enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceStatus') THEN
        CREATE TYPE "ServiceStatus" AS ENUM ('OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE');
    END IF;
END $$;

-- Check if IncidentStatus enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'IncidentStatus') THEN
        CREATE TYPE "IncidentStatus" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED');
    END IF;
END $$;

-- Check if tables exist before creating them
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Organization') THEN
        CREATE TABLE "Organization" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
        CREATE TABLE "User" (
            "id" TEXT NOT NULL,
            "clerkId" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "name" TEXT,
            "role" TEXT NOT NULL DEFAULT 'member',
            "organizationId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Service') THEN
        CREATE TABLE "Service" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "status" "ServiceStatus" NOT NULL DEFAULT 'OPERATIONAL',
            "organizationId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ServiceMetric') THEN
        CREATE TABLE "ServiceMetric" (
            "id" TEXT NOT NULL,
            "serviceId" TEXT NOT NULL,
            "status" "ServiceStatus" NOT NULL,
            "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "latency" DOUBLE PRECISION,
            "uptime" DOUBLE PRECISION NOT NULL,

            CONSTRAINT "ServiceMetric_pkey" PRIMARY KEY ("id")
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Incident') THEN
        CREATE TABLE "Incident" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "status" "IncidentStatus" NOT NULL DEFAULT 'INVESTIGATING',
            "serviceId" TEXT NOT NULL,
            "organizationId" TEXT NOT NULL,
            "createdById" TEXT NOT NULL,
            "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "resolvedAt" TIMESTAMP(3),

            CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'IncidentUpdate') THEN
        CREATE TABLE "IncidentUpdate" (
            "id" TEXT NOT NULL,
            "incidentId" TEXT NOT NULL,
            "message" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "IncidentUpdate_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Organization_slug_key') THEN
        CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_clerkId_key') THEN
        CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_email_key') THEN
        CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_organizationId_idx') THEN
        CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Service_organizationId_idx') THEN
        CREATE INDEX "Service_organizationId_idx" ON "Service"("organizationId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Incident_serviceId_idx') THEN
        CREATE INDEX "Incident_serviceId_idx" ON "Incident"("serviceId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Incident_organizationId_idx') THEN
        CREATE INDEX "Incident_organizationId_idx" ON "Incident"("organizationId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IncidentUpdate_incidentId_idx') THEN
        CREATE INDEX "IncidentUpdate_incidentId_idx" ON "IncidentUpdate"("incidentId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ServiceMetric_serviceId_idx') THEN
        CREATE INDEX "ServiceMetric_serviceId_idx" ON "ServiceMetric"("serviceId");
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_organizationId_fkey'
    ) THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Service_organizationId_fkey'
    ) THEN
        ALTER TABLE "Service" ADD CONSTRAINT "Service_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ServiceMetric_serviceId_fkey'
    ) THEN
        ALTER TABLE "ServiceMetric" ADD CONSTRAINT "ServiceMetric_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Incident_serviceId_fkey'
    ) THEN
        ALTER TABLE "Incident" ADD CONSTRAINT "Incident_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Incident_organizationId_fkey'
    ) THEN
        ALTER TABLE "Incident" ADD CONSTRAINT "Incident_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Incident_createdById_fkey'
    ) THEN
        ALTER TABLE "Incident" ADD CONSTRAINT "Incident_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'IncidentUpdate_incidentId_fkey'
    ) THEN
        ALTER TABLE "IncidentUpdate" ADD CONSTRAINT "IncidentUpdate_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
