# Build stage
FROM bun:latest AS build

# Set the working directory
WORKDIR /app

# Copy dependency files first (to leverage Docker caching for dependencies)
COPY bun.lockb package.json ./

# Install dependencies
RUN bun install

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
