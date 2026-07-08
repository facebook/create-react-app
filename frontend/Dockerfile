FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/build ./build

COPY package*.json ./

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
