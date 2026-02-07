# ================================
# Slots Availability Agent Dockerfile
# Port Flow - AI Slot Availability Agent
# ================================

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src/

# Build TypeScript
RUN npm run build

# ================================
# Production stage
# ================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S agentjs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R agentjs:nodejs /app

# Switch to non-root user
USER agentjs

# Expose port (if running as standalone service)
EXPOSE 3002

# Environment variables (override in docker-compose or runtime)
ENV NODE_ENV=production
ENV PORT=3002

# Start the application
CMD ["node", "dist/index.js"]
