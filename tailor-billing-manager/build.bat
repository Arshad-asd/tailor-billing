@echo off
REM Build script - Double-click this file to build the executable

title Building Tailor Billing Manager

cd /d "%~dp0"

echo.
echo ==========================================
echo   Tailor Billing Manager - Build Tool
echo ==========================================
echo.

REM Check if Python is available
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Python is not installed or not in PATH!
    echo.
    echo Please install Python from: https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] %PYTHON_VERSION% found
echo.

REM Install PyInstaller if needed
echo [2/4] Checking PyInstaller...
python -m pip show pyinstaller >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing PyInstaller...
    python -m pip install pyinstaller --quiet
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install PyInstaller!
        echo Try running manually: pip install pyinstaller
        echo.
        pause
        exit /b 1
    )
    echo [OK] PyInstaller installed
) else (
    echo [OK] PyInstaller already installed
)
echo.

REM Build the executable
echo [3/4] Building executable...
echo This may take 2-5 minutes. Please wait...
echo.
python build_exe.py

if errorlevel 1 (
    echo.
    echo ==========================================
    echo [ERROR] Build failed!
    echo ==========================================
    echo.
    echo Check the error messages above for details.
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo [SUCCESS] Build completed!
echo ==========================================
echo.
echo Executable location:
echo   %CD%\dist\TailorBillingManager.exe
echo.
echo Next steps:
echo   1. Test the executable: dist\TailorBillingManager.exe
echo   2. Move it anywhere you want
echo   3. Create a desktop shortcut
echo.
pause
