#!/bin/bash
# plan.sh - Unix setup script for the local Dockerized browser application
# This script will start the Docker Compose services

set -e

echo "Starting Docker Compose services..."
docker-compose -f compose.yaml up --build
