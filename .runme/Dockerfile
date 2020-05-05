FROM node:12-alpine
WORKDIR /app
COPY . .
RUN npx create-react-app my-app && cd my-app
RUN yarn && yarn global add serve
RUN yarn build
ENTRYPOINT [ "serve -l tcp://0.0.0.0:80 -s build" ]
