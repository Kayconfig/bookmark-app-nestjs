FROM node:lts
WORKDIR /app
COPY . .
RUN apt-get update
RUN apt-get install -y openssl
RUN yarn

EXPOSE 3000
CMD ["yarn", "docker:start"]