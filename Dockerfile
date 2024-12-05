# Build stage
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Install bun (latest version) globally
RUN curl -fsSL https://bun.sh/install | bash

# Make bun available in the PATH
ENV PATH="/root/.bun/bin:$PATH"

# Copy dependency files first (to leverage Docker caching for dependencies)
COPY bun.lockb package.json ./

# Install dependencies using bun
RUN bun install --production=false

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
COPY --from=build /app/dist .

# Expose port 80 for the container
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
