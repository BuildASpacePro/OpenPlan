#!/bin/bash
# if not running, please run chmod +x plan.sh to enable execution

set +e

if ! command -v docker &> /dev/null
then
  if command -v podman &> /dev/null
  then
    function docker() {
      podman $@
    }
  else
    echo "Neither docker nor podman found!!!"
    exit 1
  fi
fi

export DOCKER_COMPOSE_COMMAND="docker compose"
${DOCKER_COMPOSE_COMMAND} version &> /dev/null
if [ "$?" -ne 0 ]; then
  export DOCKER_COMPOSE_COMMAND="docker-compose"
fi

docker info | grep -e "rootless$" -e "rootless: true"
if [ "$?" -ne 0 ]; then
  export PLAN_ROOTFUL=1
  export PLAN_USER_ID=`id -u`
  export PLAN_GROUP_ID=`id -g`
else
  export PLAN_ROOTLESS=1
  export PLAN_USER_ID=0
  export PLAN_GROUP_ID=0
fi

set -e

usage() {
  echo "Usage: $1 [start, stop, cleanup, build, run, restart, logs, status] [service]" >&2
  echo "*  start: build and start all services or specified service" >&2
  echo "*  stop: stop all services or specified service" >&2
  echo "*  cleanup [force]: REMOVE all volumes and data" >&2
  echo "*  build: build all services or specified service" >&2
  echo "*  run: run specified service" >&2
  echo "*  restart: restart all services or specified service" >&2
  echo "*  logs: show logs for all services or specified service" >&2
  echo "*  status: show status of all services" >&2
  echo "*  Services: backend, api, frontend, redis, influxdb, time" >&2
  exit 1
}

if [ "$#" -eq 0 ]; then
  usage $0
fi

SERVICE=${2:-}

case $1 in
  start )
    echo "Building and starting services..."
    if [ -n "$SERVICE" ]; then
      echo "Starting service: $SERVICE"
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml up --build -d $SERVICE
    else
      echo "Starting all services..."
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml up --build -d
    fi
    ;;
  stop )
    echo "Stopping services..."
    if [ -n "$SERVICE" ]; then
      echo "Stopping service: $SERVICE"
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml stop $SERVICE
    else
      echo "Stopping all services..."
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml stop
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30
    fi
    ;;
  cleanup )
    if [ "$2" == "force" ]
    then
      echo "Force cleanup: removing all containers, networks, and volumes..."
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30 -v --remove-orphans
    else
      echo "Are you sure? Cleanup removes ALL docker volumes and all data! (1-Yes / 2-No)"
      select yn in "Yes" "No"; do
        case $yn in
          Yes ) 
            echo "Removing all containers, networks, and volumes..."
            ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30 -v --remove-orphans
            break;;
          No ) exit;;
        esac
      done
    fi
    ;;
  build )
    echo "Building services..."
    if [ -n "$SERVICE" ]; then
      echo "Building service: $SERVICE"
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml build $SERVICE
    else
      echo "Building all services..."
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml build
    fi
    ;;
  run )
    if [ -z "$SERVICE" ]; then
      echo "Error: service name required for run command"
      usage $0
    fi
    echo "Running service: $SERVICE"
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml up -d $SERVICE
    ;;
  restart )
    echo "Restarting services..."
    if [ -n "$SERVICE" ]; then
      echo "Restarting service: $SERVICE"
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml restart $SERVICE
    else
      echo "Restarting all services..."
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml restart
    fi
    ;;
  logs )
    if [ -n "$SERVICE" ]; then
      echo "Showing logs for service: $SERVICE"
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml logs -f $SERVICE
    else
      echo "Showing logs for all services..."
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml logs -f
    fi
    ;;
  status )
    echo "Service status:"
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml ps
    ;;
  * )
    usage $0
    ;;
esac