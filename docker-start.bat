@echo off
REM Docker build and run script for Wink Project

echo.
echo ====================================
echo Wink Project - Docker Build & Run
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    pause
    exit /b 1
)

REM Stop and remove existing container if it exists
echo Stopping existing container...
docker stop wink-container >nul 2>&1
docker rm wink-container >nul 2>&1

REM Build Docker image
echo.
echo Building Docker image...
docker build -t wink-project:latest .

if errorlevel 1 (
    echo ERROR: Docker build failed
    pause
    exit /b 1
)

echo.
echo Build successful!
echo.

REM Run Docker container
echo Starting Docker container on port 8001...
docker run -d ^
  --name wink-container ^
  -p 8001:80 ^
  wink-project:latest

if errorlevel 1 (
    echo ERROR: Failed to start container
    pause
    exit /b 1
)

echo.
echo ====================================
echo Container started successfully!
echo ====================================
echo.
echo Application available at: http://localhost:8001
echo.
echo Useful commands:
echo   View logs:  docker logs -f wink-container
echo   Stop:       docker stop wink-container
echo   Remove:     docker rm wink-container
echo.
pause
