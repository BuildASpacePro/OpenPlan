# src/api/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Install Python, pip, and venv
RUN apk add --no-cache python3 py3-pip python3-dev

# Create and activate virtual environment, then install Skyfield
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install skyfield

# Add the virtual environment to PATH so it's available globally
ENV PATH="/opt/venv/bin:$PATH"

# Expose port for API
EXPOSE 3000

# Start the API server
CMD ["npm", "start"]