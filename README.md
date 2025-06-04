# jsyslogd

This project contains a simple Node based syslog collector with a React front‑end.

## Database setup

A PostgreSQL database named `jsyslogd` is required. Create the tables using
`schema.sql` before starting the server:

```bash
psql -U postgres -d jsyslogd -f schema.sql
```

If you run PostgreSQL via Docker you can also mount the file into the container
so the tables are created automatically (see `docker-compose.yml`).

## Running

Install dependencies and start the server:

```bash
npm install
npm run start
```

The server expects the usual `PG*` environment variables for database access and
`JWT_SECRET` for authentication.
