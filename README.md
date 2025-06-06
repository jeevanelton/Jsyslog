sudo service postgresql start
sudo -u postgres psql
CREATE DATABASE syslog;
CREATE USER syslog WITH PASSWORD 'syslogpass';
GRANT ALL PRIVILEGES ON DATABASE syslog TO syslog;
ALTER SCHEMA public OWNER TO syslog;
GRANT ALL ON SCHEMA public TO syslog;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO syslog;