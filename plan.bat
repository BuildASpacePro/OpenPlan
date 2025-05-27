@echo off
REM plan.bat - Windows setup script for the local Dockerized browser application
REM This script will start the Docker Compose services

REM Usage: plan.bat [cli, start, stop, cleanup, build, run, test, util] <planA|planB|planC|frontend> [game=Y|N]
REM The 'game' attribute is optional and accepts Y or N.

set CMD=%1
set PLAN_CONTAINER=%2
set GAME=%3

if "%CMD%"=="" goto usage
if "%PLAN_CONTAINER%"=="" goto usage

REM Example: handle the 'game' attribute (Y/N)
if /I "%GAME%"=="game=Y" (
  echo Game mode enabled for %PLAN_CONTAINER%.
) else if /I "%GAME%"=="game=N" (
  echo Game mode disabled for %PLAN_CONTAINER%.
)

REM Build logic
if /I "%CMD%"=="build" (
  if /I "%PLAN_CONTAINER%"=="frontend" (
    docker build -t frontend-image src/frontend
    goto :eof
  )
)

REM Run logic
if /I "%CMD%"=="run" (
  if /I "%PLAN_CONTAINER%"=="frontend" (
    docker run -d --name frontend-container -p 4321:4321 frontend-image
    goto :eof
  )
)

REM Add frontend as a valid container for compose
if /I "%PLAN_CONTAINER%"=="frontend" (
  docker-compose -f compose.yaml up --build frontend
  goto :eof
)

echo Starting Docker Compose services...
docker-compose -f compose.yaml up --build %PLAN_CONTAINER%
goto :eof

:usage
echo Usage: plan.bat [cli, start, stop, cleanup, build, run, test, util] ^<planA^|planB^|planC^|frontend^> [game=Y^|N]
echo The 'game' attribute is optional and accepts Y or N.
goto :eof
