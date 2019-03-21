FROM node:8
WORKDIR /usr/src/a11ygator
COPY package.json ./
COPY yarn.lock ./
COPY . .
RUN yarn install
EXPOSE 6000
CMD [ "yarn", "start" ]
