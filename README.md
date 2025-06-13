# Satellite Mission Planner

Satellite Mission Planner is an Open Source Mission Planning application for satellites, inspired by OpenC3. It runs locally in your browser and utilizes Docker containers for its backend services. Satellite Mission Planner is designed to work on Windows, MacOS, and Linux.

The scope for this application is coarse-mission planning - it's expected that the individual satellites, ground stations and customers will handle fine-grained details of mission planning since they have immediate on-board telemetry to make decisions, whereas Mission Planning will only have late downlinked telemetry.

## Container Architecture

The application consists of 5 Docker containers working together:
- **backend** - PostgreSQL database container storing core mission data including satellites, events, ground stations, targets, and users
- **api** - Node.js/Express API server with Python integration for satellite position calculations and orbital mechanics
- **frontend** - Astro/React web interface providing 3D mapping with Cesium, Gantt charts, and real-time mission planning tools
- **redis** - High-performance caching layer for satellite position data and session management
- **influxdb** - Time-series database for storing and querying access window calculations and telemetry data

## Features
- **Modern Architecture**
  - Runs locally in your browser using Docker Compose for service orchestration
  - PostgreSQL relational database for persistent storage
  - InfluxDB time-series database for access window tracking
  - Redis caching for high-performance data access
  - RESTful API backend with Node.js
  - Reactive frontend built with Astro

- **Mission Planning Capabilities**
  - Calculates satellite access windows
  - Ground station network management
  - Stores payload target locations and calculates windows of opportunity
  - Real-time satellite position tracking
  - Multi-user support with role-based access control

## Hardware & Software Requirements
- Modern computer with at least 4GB RAM (8GB+ recommended)
- [Docker](https://www.docker.com/get-started) (required)
- [Docker Compose](https://docs.docker.com/compose/install/) (if not included with Docker)

> **Download Docker:** [https://www.docker.com/get-started](https://www.docker.com/get-started)

## Getting Started

### Quick Start (5-10 minutes)
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd missionplanning
   ```

2. **Start all services**
   - **Windows**: `plan.bat start`
   - **macOS/Linux**: `./plan.sh start`
   
   Initial startup takes 3-5 minutes as Docker downloads and builds containers.

3. **Access the application**
   - Open your browser to http://localhost:4321
   - Default login: admin/admin (change on first login)

### Management Commands

**Cross-platform scripts for all operations:**

- `./plan.sh start` or `plan.bat start` - Start all 5 services (3-5 min first time, <30 sec after)
- `./plan.sh stop` or `plan.bat stop` - Stop all running services gracefully
- `./plan.sh restart` or `plan.bat restart` - Restart all services (useful after configuration changes)
- `./plan.sh build` or `plan.bat build` - Rebuild all Docker containers
- `./plan.sh logs` or `plan.bat logs` - View real-time logs from all services
- `./plan.sh cleanup` or `plan.bat cleanup` - **WARNING**: Removes all data and volumes permanently

### Basic Usage

1. **Map View** (http://localhost:4321) - View real-time satellite positions in 2D/3D
2. **Satellites** (/satellites) - Add and manage your satellite fleet with TLE data
3. **Ground Stations** (/groundstations) - Configure tracking stations worldwide
4. **Targets** (/targets) - Define mission objectives and observation targets
5. **Timeline** (/timeline) - Plan and visualize mission activities with Gantt charts
6. **Activities** (/activities) - Schedule specific mission events and operations

## License
MIT
