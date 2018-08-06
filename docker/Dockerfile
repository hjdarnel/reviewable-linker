FROM node:9

WORKDIR /opt/bot

RUN npm install npm@6.2.x
RUN rm -rf /usr/local/lib/node_modules/npm
RUN mv node_modules/npm /usr/local/lib/node_modules/npm

COPY package.json /opt/bot
COPY package-lock.json /opt/bot
COPY src /opt/bot/src

RUN npm install
RUN npm prune --production
