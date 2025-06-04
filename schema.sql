CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    hostname TEXT,
    host_address TEXT,
    facility TEXT,
    severity TEXT,
    message TEXT,
    tag TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw TEXT
);

