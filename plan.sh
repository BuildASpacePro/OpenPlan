#!/bin/bash

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
  echo "Usage: $1 [cli, start, stop, cleanup, build, run, test, util]" >&2
  echo "*  cli: run a cli command as the default user ('cli help' for more info)" 1>&2
  echo "*  start: build and run" >&2
  echo "*  stop: stop the containers (compose stop)" >&2
  echo "*  cleanup [local] [force]: REMOVE volumes / data (compose down -v)" >&2
  echo "*  build: build the containers (compose build)" >&2
  echo "*  run: run the containers (compose up)" >&2
  echo "*  test: test plan" >&2
  echo "*  util: various helper commands" >&2
  exit 1
}

if [ "$#" -eq 0 ]; then
  usage $0
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
    args=`echo $@ | { read _ args; echo $args; }`
    ${DOCKER_COMPOSE_COMMAND} -f "$(dirname -- "$0")/compose.yaml" run -it --rm -v `pwd`:/plan/local:z -w /plan/local -e PLAN_API_PASSWORD=$PLAN_API_PASSWORD --no-deps plan-cmd-tlm-api ruby /plan/bin/plancli $args
    set +a
    ;;
  start )
    ./plan.sh build
    ./plan.sh run
    ;;
  start-ubi )
    ./plan.sh build-ubi
    ./plan.sh run-ubi
    ;;
  stop )
    ${DOCKER_COMPOSE_COMMAND} stop plan-operator
    ${DOCKER_COMPOSE_COMMAND} stop plan-script-runner-api
    ${DOCKER_COMPOSE_COMMAND} stop plan-cmd-tlm-api
    sleep 5
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30
    ;;
  cleanup )
    # They can specify 'cleanup force' or 'cleanup local force'
    if [ "$2" == "force" ] || [ "$3" == "force" ]
    then
      ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30 -v
    else
      echo "Are you sure? Cleanup removes ALL docker volumes! (1-Yes / 2-No)"
      select yn in "Yes" "No"; do
        case $yn in
          Yes ) ${DOCKER_COMPOSE_COMMAND} -f compose.yaml down -t 30 -v; break;;
          No ) exit;;
        esac
      done
    fi
    if [ "$2" == "local" ]
    then
      cd plugins/DEFAULT
      ls | grep -xv "README.md" | xargs rm -r
      cd ../..
    fi
    ;;
  build )
    scripts/linux/plan_setup.sh
    # Handle restrictive umasks - Built files need to be world readable
    umask 0022
    chmod -R +r .
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml -f compose-build.yaml build plan-ruby
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml -f compose-build.yaml build plan-base
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml -f compose-build.yaml build plan-node
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml -f compose-build.yaml build
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
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml up -d
    ;;
  run-ubi )
    PLAN_IMAGE_SUFFIX=-ubi PLAN_REDIS_VOLUME=/home/data ${DOCKER_COMPOSE_COMMAND} -f compose.yaml up -d
    ;;
  test )
    scripts/linux/plan_setup.sh
    ${DOCKER_COMPOSE_COMMAND} -f compose.yaml -f compose-build.yaml build
    scripts/linux/plan_test.sh "${@:2}"
    ;;
  util )
    set -a
    . "$(dirname -- "$0")/.env"
    scripts/linux/plan_util.sh "${@:2}"
    set +a
    ;;
  * )
    usage $0
    ;;
esac