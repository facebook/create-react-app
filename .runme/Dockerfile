FROM node:12-alpine
WORKDIR /app
COPY . .
RUN npx create-react-app my-app && cd my-app
RUN yarn 
RUN yarn start
