FROM node:12

WORKDIR /src/
COPY ./package.json /src/
COPY ./package-lock.json /src/
RUN npm ci --no-progress

COPY ./ /src/
