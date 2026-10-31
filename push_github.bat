@echo off
title Ever Deeper II - Upload Otomatis ke GitHub
cd /d "%~dp0"
node sync_github.js
echo.
pause
