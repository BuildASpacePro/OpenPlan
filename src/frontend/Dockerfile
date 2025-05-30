# Use Node.js 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install pg

# Copy all source files
COPY . .

# Build the Astro site
RUN npm run build

# Expose the port Astro will use
EXPOSE 4321

# Run the Astro server in production mode
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]