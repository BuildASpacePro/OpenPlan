# Use the official Postgres image from Docker Hub
FROM postgres:16

# Set environment variables for the default database and user
ENV POSTGRES_DB=missionplanning
ENV POSTGRES_USER=missionuser
ENV POSTGRES_PASSWORD=missionpass

# Expose the default Postgres port
EXPOSE 5432

# The data directory is already set to /var/lib/postgresql/data in the base image
# Persistent storage should be managed via Docker volumes in docker-compose.yml
