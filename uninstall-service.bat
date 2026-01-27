@echo off
REM Tailor Billing Service Uninstallation Script

echo ==========================================
echo Tailor Billing Service Uninstallation
echo ==========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

set SERVICE_NAME=TailorBillingApp

REM Check if service exists
nssm status %SERVICE_NAME% >nul 2>&1
if %errorLevel% neq 0 (
    echo Service '%SERVICE_NAME%' is not installed.
    pause
    exit /b 0
)

echo Stopping service...
nssm stop %SERVICE_NAME%
timeout /t 2 /nobreak >nul

echo Removing service...
nssm remove %SERVICE_NAME% confirm

if %errorLevel% equ 0 (
    echo.
    echo Service uninstalled successfully!
) else (
    echo.
    echo ERROR: Failed to uninstall service!
)

pause
