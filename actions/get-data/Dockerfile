FROM node:12-slim

LABEL "com.github.actions.name"="get-data"
LABEL "com.github.actions.description"="Get latest data"
LABEL "com.github.actions.icon"="arrow-up-right"
LABEL "com.github.actions.color"="blue"

# Copy the package.json and package-lock.json
COPY package*.json /

RUN npm ci

# Copy the rest of your action's code
COPY * /

# Run `node /index.js`
ENTRYPOINT ["node", "/index.js"]