CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    hostname TEXT NOT NULL,
    host_address TEXT,
    facility TEXT,
    severity TEXT,
    tag TEXT,
    message TEXT,
    raw TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
