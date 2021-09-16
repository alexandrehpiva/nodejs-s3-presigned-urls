FROM node:16-alpine

WORKDIR /usr/app
COPY package.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3001

CMD ["yarn", "start:prod"]