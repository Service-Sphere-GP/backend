# Stage 1: Builder
FROM node:22 AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Stage 2: Production
FROM node:22
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY --from=builder /usr/src/app/ .
EXPOSE 3000
CMD ["yarn", "start:prod"]