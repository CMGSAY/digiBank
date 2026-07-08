FROM node:18-alpine

# Set application directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose HTTP API Port
EXPOSE 3000

# Start server in development mode (using nodemon)
CMD ["npm", "run", "dev"]
