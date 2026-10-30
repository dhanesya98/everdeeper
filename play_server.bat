@echo off
title Ever Deeper II: Abyssal Tactics (Local Server)
echo ======================================================
echo   EVER DEEPER II: ABYSSAL TACTICS (TURUN TERUS RPG 2)
echo   Starting Local HTTP Server on Port 3000...
echo ======================================================
start http://localhost:3000
node "%~dp0server.js"
pause
