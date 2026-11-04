@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Rebuild Official Site (forum sync + Workers deploy)
echo  Repo: liuyuliangbox/CForum  workflow: Rebuild Official Site
echo.

where gh >nul 2>&1
if errorlevel 1 (
  echo [ERROR] GitHub CLI "gh" not found. Install: https://cli.github.com/
  pause
  exit /b 1
)

gh auth status >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Not logged in to gh. Run: gh auth login
  pause
  exit /b 1
)

echo Triggering workflow...
gh workflow run "Rebuild Official Site" --repo liuyuliangbox/CForum
if errorlevel 1 (
  echo [ERROR] Failed to trigger workflow.
  pause
  exit /b 1
)

echo.
echo Triggered. Opening Actions in browser...
timeout /t 2 /nobreak >nul
start "" "https://github.com/liuyuliangbox/CForum/actions/workflows/rebuild-official-site.yml"

echo Done. Close this window after the run succeeds, then check:
echo   https://game.aridjaya.eu.org/logs/
echo.
pause
endlocal
