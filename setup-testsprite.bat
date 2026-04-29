@echo off
echo Setting up TestSprite Environment Variables...

REM Set your TestSprite API key here
set TESTSPRITE_API_KEY=YOUR_API_KEY_HERE

REM Set other TestSprite environment variables
set TESTSPRITE_PROJECT_PATH=D:\IMS mise à jour\Projet final\gestion-textile-frontend-COMPLET\IMS-frontend
set TESTSPRITE_LOCAL_PORT=4200
set TESTSPRITE_TYPE=frontend

echo TestSprite environment variables set:
echo TESTSPRITE_API_KEY=%TESTSPRITE_API_KEY%
echo TESTSPRITE_PROJECT_PATH=%TESTSPRITE_PROJECT_PATH%
echo TESTSPRITE_LOCAL_PORT=%TESTSPRITE_LOCAL_PORT%
echo TESTSPRITE_TYPE=%TESTSPRITE_TYPE%

echo.
echo To make these permanent, add them to your system environment variables.
echo Or run this script before each testing session.
pause
