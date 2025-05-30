# Mission Planner API

REST API server for the Mission Planner application.

## Endpoints

### Health Check
- `GET /health` - Check if the API server is running
- `GET /db-test` - Test database connectivity

### Satellites
- `GET /api/satellites` - Get all satellites
- `POST /api/satellites` - Create a new satellite
  ```json
  {
    "name": "Satellite Name",
    "mission": "Mission Type",
    "colour": "red"
  }
  ```

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
  ```json
  {
    "satellite_id": 1,
    "activity_type": "Data Collection",
    "duration": 120
  }
  ```

### Timeline
- `GET /api/timeline` - Get timeline data (events joined with satellite info)

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT` - Server port (default: 3000)
- `POSTGRES_HOST` - Database host (default: backend)
- `POSTGRES_PORT` - Database port (default: 5432)
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password

## Development

```bash
npm install
npm run dev  # Start with nodemon for auto-reload
```

## Production

```bash
npm install --production
npm start
```