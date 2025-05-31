# src/api/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Install Skyfield and dependencies
RUN pip3 install skyfield

# Expose port for API
EXPOSE 3000

# Start the API server
CMD ["npm", "start"]