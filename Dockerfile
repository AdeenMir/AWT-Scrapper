FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium \
  fonts-liberation \
  libnss3 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  xdg-utils \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

RUN cd server && npm ci
RUN cd client && npm ci --legacy-peer-deps

COPY server ./server
COPY client ./client

RUN cd client && npm run build \
  && mkdir -p server/public \
  && cp -r dist/. server/public/

WORKDIR /app/server

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 8080

CMD ["node", "index.js"]
