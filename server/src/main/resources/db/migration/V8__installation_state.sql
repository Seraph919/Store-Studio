-- One installation = one store. Never reopen setup after it has been completed.
CREATE TABLE IF NOT EXISTS installation_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ
);
-- Preserve existing installations. They already have accounts and must not expose bootstrap.
INSERT INTO installation_state (id, completed, completed_at)
SELECT 1, EXISTS (SELECT 1 FROM users),
       CASE WHEN EXISTS (SELECT 1 FROM users) THEN NOW() ELSE NULL END
ON CONFLICT (id) DO NOTHING;
