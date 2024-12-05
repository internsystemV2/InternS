# Build stage
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Install bash, curl, and bun (version 1.1.29)
RUN apk add --no-cache bash curl \
    && curl -fsSL https://bun.sh/install | bash -s -- v1.1.29

# Set bun binary path
ENV PATH="/root/.bun/bin:${PATH}"

# Copy dependency files first (to leverage Docker caching for dependencies)
COPY package.json bun.lockb ./

# Install dependencies using bun
RUN bun install --frozen-lockfile

# Copy the rest of the application code into the container
COPY . .

# Build the application using bun
RUN bun build

# Ensure the build output exists
RUN test -d /app/dist

# Production stage
FROM nginx:alpine

# Set the working directory in the Nginx container
WORKDIR /usr/share/nginx/html

# Copy the built files from the build stage
COPY --from=build /app/dist ./

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
