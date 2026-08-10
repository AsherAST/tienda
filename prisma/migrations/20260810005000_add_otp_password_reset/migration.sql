-- Limpiar tokens de recuperación antiguos (flujo obsoleto)
DELETE FROM "password_reset_tokens";

-- DropIndex
DROP INDEX "password_reset_tokens_tokenHash_key";

-- RenameColumn
ALTER TABLE "password_reset_tokens" RENAME COLUMN "tokenHash" TO "codeHash";

-- AlterTable
ALTER TABLE "password_reset_tokens"
ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "changeTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_changeTokenHash_key" ON "password_reset_tokens"("changeTokenHash");
