FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
USER node
WORKDIR /app
COPY --chown=node:node --from=builder /app/build build/
COPY --chown=node:node package*.json .
RUN npm ci --omit dev
EXPOSE 3000
CMD [ "node", "build" ]