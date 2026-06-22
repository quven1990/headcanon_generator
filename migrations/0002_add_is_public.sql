ALTER TABLE headcanon_generations ADD COLUMN is_public INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_generations_is_public ON headcanon_generations(is_public);
