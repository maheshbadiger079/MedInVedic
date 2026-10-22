@echo off
title MedInVedic - Patient Health Workspace Server
color 0A
echo ========================================================
echo   Starting MedInVedic Backend API & Frontend Server...
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Express API & Database (Port 3001)...
start "MedInVedic Backend API (Port 3001)" cmd /k "node server/server.js"

echo [2/2] Starting Frontend Web Server (Port 3000)...
start "MedInVedic Frontend (Port 3000)" cmd /k "node server/static-server.js"

timeout /t 2 >nul
echo.
echo ========================================================
echo   ✅ Servers Active!
echo   Frontend : http://localhost:3000/pages/workspace.html
echo   API Base : http://localhost:3001/api
echo ========================================================
echo.
start http://localhost:3000/pages/workspace.html
pause
