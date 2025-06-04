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

# Copy Python requirements
COPY requirements.txt ./

# Create and activate virtual environment, then install Python dependencies
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt

# Add the virtual environment to PATH so it's available globally
ENV PATH="/opt/venv/bin:$PATH"

# Expose port for API
EXPOSE 3000

# Start the API server in development mode
CMD ["npm", "run", "dev"]