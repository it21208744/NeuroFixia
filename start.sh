#!/bin/sh
# Starts the ML service in the background and the API/web server in the foreground.
set -e
cd /app/ml-service
gunicorn --bind 127.0.0.1:5001 --workers 1 --threads 4 --timeout 600 app:app &
cd /app/backend
if [ -z "$JWT_SECRET" ]; then
  echo "[warn] JWT_SECRET not set - generating a random one (users must sign in again after restarts)"
  export JWT_SECRET=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
fi
exec node server.js
