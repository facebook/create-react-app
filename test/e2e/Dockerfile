# syntax=docker/dockerfile:1
FROM node:16
USER node
ENV NPM_CONFIG_PREFIX="/home/node/.npm"
ENV PATH="/home/node/.npm/bin:${PATH}"
RUN npm install npm@8 -g
RUN echo $PATH
WORKDIR /home/node
COPY --chown=node . /home/node/create-react-app
WORKDIR /home/node/create-react-app
RUN npm ci