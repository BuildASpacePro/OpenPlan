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
  echo "Usage: $1 [cli, start, stop, cleanup, build, run, test, util] <planA|planB|planC|frontend> [game=Y|N]" >&2
  echo "*  cli: run a cli command as the default user ('cli help' for more info) for a plan container" 1>&2
  echo "*  start: build and run the specified plan container" >&2
  echo "*  stop: stop the specified plan container" >&2
  echo "*  cleanup [local] [force]: REMOVE volumes / data for the specified plan container" >&2
  echo "*  build: build the specified plan container" >&2
  echo "*  run: run the specified plan container" >&2
  echo "*  test: test the specified plan container" >&2
  echo "*  util: various helper commands for the specified plan container" >&2
  echo "*  game: attribute is optional and accepts Y or N." >&2
  exit 1
}

if [ "$#" -eq 0 ]; then
  usage $0
fi

PLAN_CONTAINER=${2:-frontend}
GAME_ATTR=${3:-N}

if [ "$GAME_ATTR" = "game=Y" ]; then
  echo "Game mode enabled for $PLAN_CONTAINER."
elif [ "$GAME_ATTR" = "game=N" ]; then
  echo "Game mode disabled for $PLAN_CONTAINER."
fi

case $1 in
  cli )
    # Source the .env file to setup environment variables
    set -a
    . "$(dirname -- "$0")/.env"
    # Start (and remove when done --rm) the plan-cmd-tlm-api container with the current working directory
    # mapped as volume (-v) /plan/local and container working directory (-w) also set to /plan/local.
    # This allows tools running in the container to have a consistent path to the current working directory.
    # Run the command "ruby /plan/bin/plancli" with all parameters starting at 2 since the first is 'plan'
    args=`echo $@ | { read _ _ args; echo $args; }`
    ${DOCKER_COMPOSE_COMMAND} -f "$(dirname -- "$0")/compose.yaml" run -it --rm -v `pwd`:/plan/local:z -w /plan/local -e PLAN_API_PASSWORD=$PLAN_API_PASSWORD --no-deps $PLAN_CONTAINER ruby /plan/bin/plancli $args
    set +a
    ;;
  start )
    ./plan.sh build $PLAN_CONTAINER $GAME_ATTR
    # Start all services as defined in compose.yaml (db, backend, frontend)
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml up -d db backend frontend
    # Start backend2 Postgres if needed
    ${DOCKER_COMPOSE_COMMAND} -f src/backend2/docker-compose.yml up -d mission-db2
    ;;
  start-ubi )
    ./plan.sh build-ubi
    ./plan.sh run-ubi
    ;;
  stop )
    # Stop and remove all services as defined in compose.yaml (db, backend, frontend)
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml stop db backend frontend
    sleep 5
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30
    ;;
  cleanup )
    # They can specify 'cleanup force' or 'cleanup local force'
    if [ "$2" == "force" ] || [ "$3" == "force" ]
    then
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30 -v
    else
      echo "Are you sure? Cleanup removes ALL docker volumes and all data for $PLAN_CONTAINER! (1-Yes / 2-No)"
      select yn in "Yes" "No"; do
        case $yn in
          Yes ) ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30 -v; break;;
          No ) exit;;
        esac
      done
    fi
    if [ "$4" == "local" ]
    then
      cd plugins/DEFAULT
      ls | grep -xv "README.md" | xargs rm -r
      cd ../..
    fi
    ;;
  build )
    if [ "$PLAN_CONTAINER" = "frontend" ]; then
      # Build the frontend container using the Dockerfile in src/frontend
      docker build -t frontend-image ./src/frontend
    else
      scripts/linux/plan_setup.sh
      # Handle restrictive umasks - Built files need to be world readable
      umask 0022
      chmod -R +r .
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml -f compose-build.yaml build $PLAN_CONTAINER
    fi
    ;;
  build-ubi )
    set -a
    . "$(dirname -- "$0")/.env"
    if test -f /etc/ssl/certs/ca-bundle.crt
    then
      cp /etc/ssl/certs/ca-bundle.crt ./cacert.pem
    fi
    scripts/linux/plan_setup.sh
    scripts/linux/plan_build_ubi.sh
    set +a
    ;;
  run )
    if [ "$PLAN_CONTAINER" = "frontend" ]; then
      # Build the frontend image from src/frontend/Dockerfile if it doesn't exist, then run the container
      if ! docker image inspect frontend-image:latest > /dev/null 2>&1; then
        echo "Frontend image not found. Building frontend-image from src/frontend/Dockerfile..."
        docker build -t frontend-image ./src/frontend
      fi
      # Remove any existing frontend-container to avoid name conflicts
      if docker ps -a --format '{{.Names}}' | grep -Eq '^frontend-container$'; then
        docker rm -f frontend-container
      fi
      docker run -d --name frontend-container -p 4321:4321 frontend-image
    else
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml up -d $PLAN_CONTAINER
    fi
    ;;
  run-ubi )
    PLAN_IMAGE_SUFFIX=-ubi PLAN_REDIS_VOLUME=/home/data ${DOCKER_COMPOSE_COMMAND} -f compose.yaml up -d
    ;;
  test )
    scripts/linux/plan_setup.sh
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml -f compose-build.yaml build $PLAN_CONTAINER
    scripts/linux/plan_test.sh "${@:4}"
    ;;
  util )
    set -a
    . "$(dirname -- "$0")/.env"
    scripts/linux/plan_util.sh "${@:4}"
    set +a
    ;;
  * )
    usage $0
    ;;
esac