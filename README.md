# jsyslogd

A small syslog server with a React based web interface. Logs are stored in
a PostgreSQL database and can be viewed in real time from the browser.

The project ships with a `Dockerfile` and a `docker-compose.yml` so it can be
started with a single command.

## Running with Docker

The repository includes everything required to run the app in containers. The
compose setup builds the React frontend, starts the Node backend and a
PostgreSQL database. The file `schema.sql` is mounted into the database container
and will create the required tables on first launch.

```bash
docker-compose up --build
```

The web UI will be available on <http://localhost:3000>. Syslog messages can be
sent to port `514` using UDP or TCP.

Configuration options can be adjusted in `backend/config.json` before building
the image or by mounting a custom file.

If you prefer to run the application without Docker you must manually create the
database tables using `schema.sql` and set the `PG*` environment variables for
the backend.

Unit tests for the log parser can be executed with:

```bash
node backend/unit/testParseSyslog.js
```
