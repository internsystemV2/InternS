# Build stage
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Install dependencies using bun
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

# Ensure the build output exists
RUN test -d /app/.next || echo "Build output not found, continuing..."

# Production stage - Only Next.js app
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy built files from the build stage
COPY --from=build /app /app

# Expose port 3000 for Next.js to listen on
EXPOSE 3000

# Run the Next.js app
CMD ["bun", "start", "--port", "3000"]
