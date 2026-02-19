#!/bin/sh
set -e

CERT_DIR="/app/certs"
CERT_PATH="$CERT_DIR/dashboard.pfx"

if [ ! -f "$CERT_PATH" ]; then
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -days 3650 \
        -newkey rsa:2048 \
        -keyout /tmp/dashboard.key \
        -out /tmp/dashboard.crt \
        -subj "/CN=dashboard"
    openssl pkcs12 -export \
        -out "$CERT_PATH" \
        -inkey /tmp/dashboard.key \
        -in /tmp/dashboard.crt \
        -password pass:dashboard
    rm -f /tmp/dashboard.key /tmp/dashboard.crt
fi

exec dotnet Dashboard.Web.dll
