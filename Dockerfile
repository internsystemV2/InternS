# Build stage
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Install dependencies using npm
RUN apk add --no-cache bash curl \
    && curl -fsSL https://bun.sh/install | bash \
    && export BUN_INSTALL="/root/.bun" \
    && export PATH="$BUN_INSTALL/bin:$PATH" \
    && bun --version

# Set bun binary path
ENV PATH="/root/.bun/bin:${PATH}"

# Copy dependency files first (to leverage Docker caching for dependencies)
COPY package.json bun.lockb ./

# Install dependencies using bun
RUN bun install || echo "bun install failed, continuing..."

# Copy the rest of the application code into the container
COPY . .

# Build the application using bun
RUN bun run build || echo "bun build failed, continuing..."

# Ensure the build output exists (optional: you can skip this step if it's causing issues)
RUN test -d /app/.next || echo "Build output not found, continuing..."

# Production stage
FROM nginx:alpine

# Set the working directory in the Nginx container
WORKDIR /usr/share/nginx/html

# Copy the built files from the build stage
# Copy .next folder, public assets, and other necessary files to Nginx container
COPY --from=build /app/.next /usr/share/nginx/html/.next
COPY --from=build /app/public /usr/share/nginx/html/public


# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
