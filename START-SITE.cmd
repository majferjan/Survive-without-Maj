@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% equ 0 (
  start "" "http://127.0.0.1:4173"
  node serve.cjs
) else (
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    start "" "http://127.0.0.1:4173"
    "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" serve.cjs
  ) else (
    echo Install Node.js or use VS Code Live Server to preview this site.
    pause
  )
)
