-- Remove operator -> terminal linkage so operators can access all terminals
ALTER TABLE "OperatorProfile" DROP CONSTRAINT "OperatorProfile_terminal_id_fkey";
ALTER TABLE "OperatorProfile" DROP COLUMN "terminal_id";
