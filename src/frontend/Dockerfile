# src/frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

RUN npm run build

# Expose port
EXPOSE 4321

# Start the development server for live reloading
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]