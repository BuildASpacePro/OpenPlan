@echo off
REM plan.bat - Windows setup script for the local Dockerized browser application
REM This script will start the Docker Compose services

echo Starting Docker Compose services...
docker-compose -f compose.yaml up --build
