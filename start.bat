@echo off
title ExpenseFlow - Full-Stack Expense Tracker
echo ===================================================
echo    Starting ExpenseFlow Full-Stack Server...
echo ===================================================
echo.
cd /d "%~dp0"

echo Opening browser at http://localhost:5000 ...
start http://localhost:5000

echo.
echo Server is running. Press Ctrl+C to stop.
echo.
node backend/server.js
pause
