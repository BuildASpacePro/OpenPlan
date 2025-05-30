# src/frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the Astro application
RUN npm run build

# Expose port
EXPOSE 4321

# Start the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]