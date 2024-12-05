# Build stage
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Install bash and curl (if needed)
RUN apk add --no-cache bash curl

# Copy dependency files first (to leverage Docker caching for dependencies)
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code into the container
COPY . .

# Build the application using yarn
RUN yarn build

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
