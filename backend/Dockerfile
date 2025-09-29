# Use Node.js official image as base
FROM node:18-alpine

# Install PostgreSQL client for pg_isready command and wget for health checks
RUN apk add --no-cache postgresql-client wget bash

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build and migration)
RUN npm install

# Copy source code and configuration files
COPY . .

# Copy and make startup script executable
COPY ./script/auto/start.sh ./
RUN chmod +x start.sh

# Build the application
RUN npm run build

# Keep dependencies needed for migration and runtime
# Don't prune devDependencies as they're needed for migration:run

# Expose port
EXPOSE 3000

# Use startup script as entrypoint
ENTRYPOINT ["./start.sh"]