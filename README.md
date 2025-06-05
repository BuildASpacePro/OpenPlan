# OpenPlan: The Open Source Mission Planning Software

OpenPlan is an Open Source Mission Planning application for satellites, inspired by OpenC3. It runs locally in your browser and utilizes Docker containers for its backend services. OpenPlan is designed to work on Windows, MacOS, and Linux.

While originally built to help plan satellite operations and coordinate actions, it can also be used for planning of other terrestial-based assets and ensuring that they follow the user's plan. 
The scope for this application is coarse-mission planning - it's expected that the mission architecture will handle fine-grained details of mission planning since each node/asset/satellite will have on-board telemetry to make decisions, whereas Mission Planning will only have downlinked telemetry data with some latency. 

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

### Setup
1. Clone this repository.
2. Run the setup script for your OS:
   - On Windows: `plan.bat`
   - On macOS/Linux: `./plan.sh`
3. Open your browser to the provided local URL.

## License
MIT
