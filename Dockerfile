# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the build files from the builder stage
COPY --from=builder /app/dist ./dist

# Copy any other necessary files (e.g., configuration files)
COPY --from=builder /app/.env ./

# Expose the port the app runs on
EXPOSE 3300

# Start the application
CMD ["node", "dist/main"]

