@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0submit-to-github.ps1"
set "submitResult=%errorlevel%"
echo.
pause
exit /b %submitResult%
