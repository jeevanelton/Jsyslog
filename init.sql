CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  hostname VARCHAR(100),
  host_address INET,
  facility VARCHAR(20),
  severity VARCHAR(20),
  tag VARCHAR(50),
  message TEXT,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw TEXT
);



CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 👇 Insert default admin user
INSERT INTO users (username, password_hash, role)
VALUES (
  'admin',
  '$2a$10$Ly/kXgisvIHKGZLF9O33Ve0SJ81IBNWXna/pnqAdzCXd6eu3bFI9u', -- bcrypt hash for "admin123"
  'admin'
)
ON CONFLICT (username) DO NOTHING;