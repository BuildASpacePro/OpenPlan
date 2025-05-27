# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Astro application
RUN npm run build

# Expose port 4321 (Astro's default preview port)
EXPOSE 4321

# Start the application in preview mode
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]