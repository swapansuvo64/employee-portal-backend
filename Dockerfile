# Use Node.js LTS version with Alpine for smaller image size
FROM node:18-alpine

# Install curl for healthchecks and CA certificates for SSL
RUN apk add --no-cache curl ca-certificates

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

# Create a non-root user and group for security
RUN addgroup -g 1001 -S nodeapp && \
    adduser -S nodeapp -u 1001 -G nodeapp

# Change ownership of the working directory to the non-root user
RUN chown -R nodeapp:nodeapp /usr/src/app

# Switch to non-root user
USER nodeapp

# Expose port (match with your server.js PORT environment variable)
EXPOSE 9000

# Better health check that verifies both web server and database
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f https://internalApi.sequoia-print.com/health || exit 1

# Run the application
CMD ["node", "server.js"]