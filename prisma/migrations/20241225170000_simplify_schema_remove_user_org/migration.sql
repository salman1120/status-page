-- Drop old tables and constraints
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Organization" CASCADE;

-- Add UNDER_MAINTENANCE to ServiceStatus enum if it doesn't exist
ALTER TYPE "ServiceStatus" ADD VALUE IF NOT EXISTS 'UNDER_MAINTENANCE';

-- Update Service table
ALTER TABLE "Service" DROP CONSTRAINT IF EXISTS "Service_organizationId_fkey";
CREATE INDEX IF NOT EXISTS "Service_organizationId_idx" ON "Service"("organizationId");

-- Update Incident table
ALTER TABLE "Incident" DROP CONSTRAINT IF EXISTS "Incident_organizationId_fkey";
ALTER TABLE "Incident" DROP CONSTRAINT IF EXISTS "Incident_createdById_fkey";
CREATE INDEX IF NOT EXISTS "Incident_organizationId_idx" ON "Incident"("organizationId");
CREATE INDEX IF NOT EXISTS "Incident_serviceId_idx" ON "Incident"("serviceId");

-- Update IncidentUpdate table
ALTER TABLE "IncidentUpdate" DROP CONSTRAINT IF EXISTS "IncidentUpdate_createdById_fkey";
CREATE INDEX IF NOT EXISTS "IncidentUpdate_incidentId_idx" ON "IncidentUpdate"("incidentId");

-- Update ServiceMetric table
CREATE INDEX IF NOT EXISTS "ServiceMetric_serviceId_idx" ON "ServiceMetric"("serviceId");
