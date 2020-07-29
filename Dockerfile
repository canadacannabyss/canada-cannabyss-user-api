FROM node:10-alpine

WORKDIR /home/davi/Documents/Dev/cryptic-activist/backend
COPY package.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 5000
CMD ["yarn", "start"]