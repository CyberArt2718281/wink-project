@echo off
REM Stop Docker container

echo.
echo Stopping Wink Project container...
docker stop wink-container

if errorlevel 1 (
    echo ERROR: Container not running
    pause
    exit /b 1
)

echo.
echo Container stopped successfully!
echo.
pause
