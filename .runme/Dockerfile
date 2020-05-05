FROM node:12-alpine
WORKDIR /app
COPY . .
RUN yarn && yarn build
ENTRYPOINT npx http-server ./build -a 0.0.0.0 -p 80 
