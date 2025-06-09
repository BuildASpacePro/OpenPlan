# Multi-stage build with Python optimization
FROM node:18-alpine AS deps
RUN apk add --no-cache python3 py3-pip python3-dev build-base
WORKDIR /app
COPY package*.json requirements.txt ./
RUN npm ci --only=production && npm cache clean --force
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

FROM node:18-alpine AS dev
RUN apk add --no-cache python3 py3-pip python3-dev build-base
WORKDIR /app
COPY package*.json requirements.txt ./
RUN npm ci
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:18-alpine AS production
RUN apk add --no-cache python3
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
EXPOSE 3000
CMD ["npm", "start"]