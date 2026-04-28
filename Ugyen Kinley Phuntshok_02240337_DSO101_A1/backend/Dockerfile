FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Remove .env files if accidentally included (safety measure)
RUN rm -f .env .env.local .env.development .env.test

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
