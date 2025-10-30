-- Create the main database (if not exists)
CREATE DATABASE contextweave OWNER contextweave_user;

-- Switch to the database
\c contextweave

-- Create initial tables for ContextWeave
CREATE TABLE IF NOT EXISTS decisions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Give permissions to the user
GRANT ALL PRIVILEGES ON DATABASE contextweave TO contextweave_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO contextweave_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO contextweave_user;
