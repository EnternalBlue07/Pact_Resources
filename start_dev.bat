@echo off
title PACT Development Launcher
echo ===================================================
echo   PACT: Proof, Authorization, Custody & Trust
echo   CodeHack India 2026 - Development Launcher
echo ===================================================
echo.

echo Starting FastAPI Backend Server on port 8000...
start "PACT Backend (FastAPI)" cmd /k "cd /d D:\pact-resource-trust\backend && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo Starting React + Vite Frontend on port 5173...
start "PACT Frontend (React + Vite)" cmd /k "cd /d D:\pact-resource-trust\frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ===================================================
echo   Both services launched!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000/docs
echo ===================================================

