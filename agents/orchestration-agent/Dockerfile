# ================================
# Orchestration Agent Dockerfile
# Port Flow - AI Agent Orchestrator
# ================================
# NOTE: This agent depends on booking-agent and slots-availability-agent
# Build from the agents/ directory context to include sibling packages

# Build stage
FROM node:22-alpine AS builder

WORKDIR /agents

# Copy all agent package files for workspace setup
COPY booking-agent/package*.json ./booking-agent/
COPY slots-availability-agent/package*.json ./slots-availability-agent/
COPY orchestration-agent/package*.json ./orchestration-agent/

# Install dependencies for all agents
WORKDIR /agents/booking-agent
RUN npm ci

WORKDIR /agents/slots-availability-agent
RUN npm ci

WORKDIR /agents/orchestration-agent
RUN npm ci

# Copy source code for all agents
WORKDIR /agents
COPY booking-agent/tsconfig.json ./booking-agent/
COPY booking-agent/src ./booking-agent/src/

COPY slots-availability-agent/tsconfig.json ./slots-availability-agent/
COPY slots-availability-agent/src ./slots-availability-agent/src/

COPY orchestration-agent/tsconfig.json ./orchestration-agent/
COPY orchestration-agent/src ./orchestration-agent/src/

# Build all agents
WORKDIR /agents/booking-agent
RUN npm run build

WORKDIR /agents/slots-availability-agent
RUN npm run build

WORKDIR /agents/orchestration-agent
RUN npm run build

# ================================
# Production stage
# ================================
FROM node:22-alpine AS production

WORKDIR /agents

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S agentjs -u 1001

# Copy package files for all agents
COPY booking-agent/package*.json ./booking-agent/
COPY slots-availability-agent/package*.json ./slots-availability-agent/
COPY orchestration-agent/package*.json ./orchestration-agent/

# Install production dependencies
WORKDIR /agents/booking-agent
RUN npm ci --only=production

WORKDIR /agents/slots-availability-agent
RUN npm ci --only=production

WORKDIR /agents/orchestration-agent
RUN npm ci --only=production

# Copy built files from builder
WORKDIR /agents
COPY --from=builder /agents/booking-agent/dist ./booking-agent/dist/
COPY --from=builder /agents/slots-availability-agent/dist ./slots-availability-agent/dist/
COPY --from=builder /agents/orchestration-agent/dist ./orchestration-agent/dist/

# Change ownership to non-root user
RUN chown -R agentjs:nodejs /agents

# Switch to non-root user
USER agentjs

WORKDIR /agents/orchestration-agent

# Expose port
EXPOSE 3000

# Environment variables (override in docker-compose or runtime)
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/index.js"]
