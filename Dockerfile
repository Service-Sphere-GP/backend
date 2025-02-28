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
# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++
COPY package.json yarn.lock ./
# Install production dependencies
RUN yarn install --production
# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist
# Copy environment files (needed for JWT secret)
COPY .env* ./
EXPOSE 3000
CMD ["yarn", "start:prod"]
