@echo off
echo ==============================================
echo  SubTrack Git Initialization ^& Push Script
echo ==============================================
echo.

:: Move to the directory of this batch script
cd /d "%~dp0"

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your system PATH.
    echo Please install Git from https://git-scm.com/ and try again.
    pause
    exit /b 1
)

:: Initialize git if .git directory doesn't exist
if not exist .git (
    echo [1/5] Initializing Git repository...
    git init
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to initialize Git repository.
        pause
        exit /b 1
    )
) else (
    echo [1/5] Git repository already initialized.
)

:: Check remote origin
git remote | findstr "^origin$" >nul
if %errorlevel% neq 0 (
    echo [2/5] Adding remote origin...
    git remote add origin https://github.com/Rudra-Narayan-Swain/SubTrack.git
) else (
    echo [2/5] Remote origin already exists. Checking URL...
    git remote set-url origin https://github.com/Rudra-Narayan-Swain/SubTrack.git
)

:: Set branch to main
echo [3/5] Setting default branch to main...
git branch -M main

:: Add files
echo [4/5] Staging files...
git add .

:: Commit files
echo [5/5] Committing and pushing files...
git commit -m "Initial commit"
git push -u origin main

echo.
echo ==============================================
echo  Process completed!
echo  Check your repository at: https://github.com/Rudra-Narayan-Swain/SubTrack.git
echo ==============================================
echo.
pause
