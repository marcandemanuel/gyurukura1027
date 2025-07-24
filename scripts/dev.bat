@echo off
REM Development startup script for Windows

echo Starting LOTR Marathon App Development Environment...

echo Starting Flask backend on port 2020...
start "Flask Backend" python app.py

echo Waiting for Flask to start...
timeout /t 3 /nobreak > nul

echo Starting Vite frontend on port 2006...
npm run dev

echo.
echo Both servers are running!
echo Frontend: http://localhost:2006
echo Backend API: http://localhost:2020
echo.
echo Press Ctrl+C to stop the frontend server
echo Close the Flask Backend window to stop the backend
