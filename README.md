# jsyslogd

A small syslog server with a React based web interface. Logs are stored in a
PostgreSQL database and can be viewed in real time from the browser. The
repository includes everything required to run the service either with Docker or
directly on your machine.

## Quick start with Docker

1. Build and start the stack:

   ```bash
   docker-compose up --build
   ```

   This launches the app container and a PostgreSQL database. The schema in
   `schema.sql` is automatically loaded on the first run.

2. Browse to <http://localhost:3000> to access the web UI. Send syslog messages
   to port `514` (UDP or TCP).

If you provide `HTTPS_KEY` and `HTTPS_CERT` environment variables pointing to a
TLS key and certificate, the web interface will be served over HTTPS.

Configuration options such as log retention and forwarding are defined in
`backend/config.json`. To customise them when using Docker, provide your own
version of this file as a volume mount.

Multiple forwarding targets can be configured and TLS is supported by setting
`protocol: "tls"` for a target.

## Manual installation

1. Install **Node.js 18** and **PostgreSQL**.
2. Run `npm install` in the project root.
3. Create a database and load the schema:

   ```bash
   createdb jsyslogd
   psql -d jsyslogd -f schema.sql
   ```

4. Provide the following environment variables (e.g. in a `.env` file):

   ```
   PGUSER=postgres
   PGPASSWORD=postgres
   PGDATABASE=jsyslogd
   PGHOST=localhost
   PGPORT=5432
   JWT_SECRET=changeme
   ```

5. Start the server:

   ```bash
   npm start
   ```

## Metrics

Prometheus style metrics are available at `/metrics`.

## Testing

Run the parser unit tests with:

```bash
npm test
```

## License

See [LICENSE](LICENSE) for license information.
