# Dev-mode image: source comes from a bind mount in docker-compose.yml, not
# from this image (see the (lack of) `COPY . .` below) -- this Dockerfile
# only needs to produce a container with the right runtime + node_modules
# installed. package.json's own "dev" script (tsx --watch) is what actually
# runs the app; that's why there's no build step here.
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

EXPOSE 8088

CMD ["npx", "tsx", "--watch", "index.ts"]
