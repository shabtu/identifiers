FROM node:20-alpine AS lib-builder
WORKDIR /lib
COPY package*.json tsconfig.json ./
COPY src ./src
RUN npm ci && npm run build

FROM node:20-alpine AS api-builder
WORKDIR /app
COPY api/package*.json ./
RUN npm ci
COPY api/tsconfig.json ./
COPY api/src ./src
COPY --from=lib-builder /lib/dist /dist
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY api/package*.json ./
RUN npm ci --omit=dev
COPY --from=api-builder /app/dist ./dist
COPY --from=lib-builder /lib/dist /dist
RUN mkdir -p /app/data
VOLUME ["/app/data"]
EXPOSE 3000
CMD ["node", "dist/server.js"]
