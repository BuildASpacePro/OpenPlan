# Local Dockerized Browser Application

This project is a cross-platform application that runs locally in a browser window and utilizes Docker containers for its backend services. It is designed to work on Windows, macOS, and Linux.

## Features
- Runs locally in your browser
- Uses Docker Compose for service orchestration
- Cross-platform support (Windows, macOS, Linux)

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/install/) (if not included with Docker)

### Setup
1. Clone this repository.
2. Run the setup script for your OS:
   - On Windows: `plan.bat`
   - On macOS/Linux: `./plan.sh`
3. Open your browser to the provided local URL.

### File Structure
- `plan.bat` / `plan.sh`: Setup scripts for Windows and Unix systems
- `compose.yaml`: Docker Compose configuration
- `docs/`: Documentation
- `examples/`: Example configurations and usage
- `plugins/`: Extendable plugins
- `scripts/`: Utility scripts

## License
MIT
