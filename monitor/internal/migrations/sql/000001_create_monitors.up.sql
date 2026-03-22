CREATE TABLE IF NOT EXISTS monitors (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    last_status_code INTEGER,
    response_time_ms INTEGER,
    last_checked_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
