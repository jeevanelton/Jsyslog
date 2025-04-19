#!/bin/bash
echo "[*] Installing jsyslogd..."

mkdir -p /opt/jsyslogd /var/log/jsyslogd
cp -r . /opt/jsyslogd

cp jsyslogd.service /etc/systemd/system/
systemctl daemon-reexec
systemctl enable jsyslogd
systemctl start jsyslogd

echo "[✓] Installed and running!"
