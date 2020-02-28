FROM node:12-slim

LABEL "com.github.actions.name"="get-data"
LABEL "com.github.actions.description"="Get latest data"
LABEL "com.github.actions.icon"="arrow-up-right"
LABEL "com.github.actions.color"="blue"

WORKDIR /src/
COPY ./package*.json /src/
RUN npm ci --no-progress

COPY ./ /src/

ENTRYPOINT ["node", "/src/run-once.js"]
