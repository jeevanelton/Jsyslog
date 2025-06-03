# jsyslogd

A small syslog server with a React based web interface.

## Running with Docker

The repository includes a `Dockerfile` and `docker-compose.yml` for a quick start. The compose setup starts a PostgreSQL database and the application server.

```bash
docker-compose up --build
```

The web UI will be available on <http://localhost:3000>. Syslog messages can be sent to port `514` using UDP or TCP.

Configuration options can be adjusted in `backend/config.json` before building the image or by mounting a custom file.
