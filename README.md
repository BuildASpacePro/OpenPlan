# OpenPlan: The Open Source Mission Planning Software

OpenPlan is a cross-platform mission planning application inspired by OpenC3, designed to be used for satellites. It runs locally in your browser and utilizes Docker containers for its backend services. OpenPlan is designed to work on Windows, macOS, and Linux.
While originally built to help plan satellite operations and coordinate actions, it can also be used for planning of other terrestial-based assets and ensuring that they follow the user's plan. 
The scope for this software is coarse-mission planning - it's expected that the mission architecture will handle fine-grained details of mission planning since each node/asset/satellite will have on-board telemetry to make decisions, whereas Mission Planning will only have downlinked telemetry data with some latency. 

## Features
- Runs locally in your browser
- Uses Docker Compose for service orchestration
- Cross-platform support (Windows, macOS, Linux)
- Inspired by OpenC3 for extensibility and modularity

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
