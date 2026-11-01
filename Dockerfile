# NeuroFixia - single container: React build + Node API (port 7860) + Python ML service (port 5001)
# Works on Hugging Face Spaces (Docker SDK), Render, Railway, Fly.io or any Docker host.

# ---------- 1. build the React frontend
FROM node:20-bookworm-slim AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN CI=false npm run build

# ---------- 2. runtime
FROM python:3.11-slim-bookworm
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    HOME=/home/user NODE_ENV=production PORT=7860 ML_URL=http://127.0.0.1:5001 \
    MONGOMS_DOWNLOAD_DIR=/home/user/.cache/mongodb-binaries TF_CPP_MIN_LOG_LEVEL=3
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates gnupg libgl1 libglib2.0-0 libcurl4 \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 user
WORKDIR /app

COPY ml-service/requirements.txt ml-service/requirements.txt
RUN pip install -r ml-service/requirements.txt

COPY backend/package.json backend/package-lock.json backend/
RUN cd backend && npm ci --omit=dev --no-audit --no-fund

COPY ml-service/ ml-service/
COPY backend/ backend/
COPY --from=web /web/build frontend/build
COPY start.sh .
RUN chmod +x start.sh && chown -R user:user /app /home/user
USER user
# pre-download the embedded MongoDB binary used when MONGO_URI is not set
RUN cd backend && node -e "require('mongodb-memory-server').MongoMemoryServer.create().then(s=>s.stop()).then(()=>console.log('mongod ready'))"

EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD curl -fs http://127.0.0.1:7860/api/health || exit 1
CMD ["./start.sh"]
