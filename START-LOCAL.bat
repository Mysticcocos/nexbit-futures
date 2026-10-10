@echo off
setlocal
cd /d "%~dp0"
title NEXBIT Local Server

echo ============================================
echo          NEXBIT - LOCAL START
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Install Node.js 22 LTS and run this file again.
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODEVER=%%i
echo [OK] Node %NODEVER%

if not exist "node_modules\vite\bin\vite.js" (
  echo.
  echo [1/2] Installing project dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
) else (
  echo [OK] Dependencies already installed.
)

echo.
echo [2/2] Starting NEXBIT...
echo Open in browser: http://localhost:8080/
echo To stop the server press Ctrl+C.
echo.

node scripts\start-local.mjs
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" echo [ERROR] Server stopped with code %EXITCODE%.
pause
exit /b %EXITCODE%
