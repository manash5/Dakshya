# Dev-mode image: source comes from a bind mount in docker-compose.yml, not
# from this image -- `npm run dev` (Next's dev server) is the actual runtime,
# not a production build.
FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
