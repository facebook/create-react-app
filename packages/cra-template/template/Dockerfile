FROM node:lts-alpine AS builder

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci

ENV NODE_ENV=production

COPY . /app
RUN npm run build

FROM nginx:1.7-alpine

COPY --from=builder /app/build /usr/share/nginx/html
