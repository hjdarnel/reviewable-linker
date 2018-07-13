FROM node:9

WORKDIR /opt/bot

COPY package.json /opt/bot
COPY package-lock.json /opt/bot
COPY src /opt/bot/src

RUN npm install
RUN npm prune --production
