@echo off
title LEONIDA - GTA 6 App
color 0D
echo.
echo  ========================================
echo     LEONIDA - GTA 6 Community Hub
echo  ========================================
echo.
echo  Starting the app...
echo  Once compiled, open: http://localhost:3000
echo  Press Ctrl+C to stop the server.
echo.

cd /d "%~dp0app\frontend"
npx craco start
pause
