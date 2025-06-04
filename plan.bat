@echo off
REM plan.bat - Windows Docker Compose management script for Mission Planning
REM This script manages all Docker Compose services defined in compose.yaml

set CMD=%1
set SERVICE=%2

if "%CMD%"=="" goto usage

REM Check for docker-compose or docker compose
where docker-compose >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set DOCKER_COMPOSE_COMMAND=docker-compose
) else (
    set DOCKER_COMPOSE_COMMAND=docker compose
)

goto %CMD% 2>nul || goto usage

:start
echo Building and starting services...
if "%SERVICE%"=="" (
    echo Starting all services...
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml up --build -d
) else (
    echo Starting service: %SERVICE%
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml up --build -d %SERVICE%
)
goto :eof

:stop
echo Stopping services...
if "%SERVICE%"=="" (
    echo Stopping all services...
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml stop
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml down -t 30
) else (
    echo Stopping service: %SERVICE%
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml stop %SERVICE%
)
goto :eof

:cleanup
if /I "%2"=="force" (
    echo Force cleanup: removing all containers, networks, and volumes...
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml down -t 30 -v --remove-orphans
) else (
    echo WARNING: This will remove ALL docker volumes and data!
    set /p confirm=Are you sure? (y/N): 
    if /I "%confirm%"=="y" (
        echo Removing all containers, networks, and volumes...
        %DOCKER_COMPOSE_COMMAND% -f compose.yaml down -t 30 -v --remove-orphans
    ) else (
        echo Cleanup cancelled.
    )
)
goto :eof

:build
echo Building services...
if "%SERVICE%"=="" (
    echo Building all services...
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml build
) else (
    echo Building service: %SERVICE%
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml build %SERVICE%
)
goto :eof

:run
if "%SERVICE%"=="" (
    echo Error: service name required for run command
    goto usage
)
echo Running service: %SERVICE%
%DOCKER_COMPOSE_COMMAND% -f compose.yaml up -d %SERVICE%
goto :eof

:restart
echo Restarting services...
if "%SERVICE%"=="" (
    echo Restarting all services...
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml restart
) else (
    echo Restarting service: %SERVICE%
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml restart %SERVICE%
)
goto :eof

:logs
if "%SERVICE%"=="" (
    echo Showing logs for all services...
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml logs -f
) else (
    echo Showing logs for service: %SERVICE%
    %DOCKER_COMPOSE_COMMAND% -f compose.yaml logs -f %SERVICE%
)
goto :eof

:status
echo Service status:
%DOCKER_COMPOSE_COMMAND% -f compose.yaml ps
goto :eof

:usage
echo Usage: plan.bat [start^|stop^|cleanup^|build^|run^|restart^|logs^|status] [service]
echo.
echo Commands:
echo   start     - build and start all services or specified service
echo   stop      - stop all services or specified service
echo   cleanup   - REMOVE all volumes and data (add 'force' to skip confirmation)
echo   build     - build all services or specified service
echo   run       - run specified service
echo   restart   - restart all services or specified service
echo   logs      - show logs for all services or specified service
echo   status    - show status of all services
echo.
echo Services: backend, api, frontend, redis, influxdb, time
echo.
echo Examples:
echo   plan.bat start           - Start all services
echo   plan.bat start frontend  - Start only frontend service
echo   plan.bat logs api        - Show logs for API service
echo   plan.bat cleanup force   - Force cleanup without confirmation
goto :eof