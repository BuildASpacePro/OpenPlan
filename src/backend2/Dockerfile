# Use the official Postgres image from Docker Hub
FROM postgres:16

# Set environment variables for the default database and user
ENV POSTGRES_DB=missionplanning2
ENV POSTGRES_USER=missionuser2
ENV POSTGRES_PASSWORD=missionpass2

# Expose the default Postgres port
EXPOSE 5432

# The data directory is already set to /var/lib/postgresql/data in the base image
# Persistent storage should be managed via Docker volumes in docker-compose.yml
