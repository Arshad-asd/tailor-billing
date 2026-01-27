@echo off
REM Simple batch file to run the GUI application

echo Starting Tailor Billing Manager...
echo.

cd /d "%~dp0"
python main.py

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start application!
    echo Make sure Python is installed and in your PATH.
    pause
)
