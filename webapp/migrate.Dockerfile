FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /migrate
RUN npm install drizzle-orm
RUN npm install drizzle-kit
RUN npm install pg
COPY drizzle.config.ts .
COPY drizzle ./drizzle
CMD ["npx", "drizzle-kit", "migrate"]
