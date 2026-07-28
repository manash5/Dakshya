# Dual-purpose image: locally, docker-compose.yml bind-mounts the live
# ./backend folder over the COPY below and overrides CMD with --watch for
# live reload. Standalone (e.g. deployed directly on Render, no bind mount
# available), this image needs to be self-sufficient -- hence COPY . . and
# a plain, non-watching CMD as the production-safe default.
FROM node:24-slim

WORKDIR /app

# bcrypt has a native addon; if no prebuilt binary matches this image's
# node/platform combination, npm needs a C++ toolchain to compile it from
# source during `npm install`.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 8088

CMD ["npx", "tsx", "index.ts"]
