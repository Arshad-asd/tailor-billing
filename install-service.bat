@echo off
REM Tailor Billing Service Installation Script
REM This script installs the application as a Windows service using NSSM

echo ==========================================
echo Tailor Billing Service Installation
echo ==========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% NEQ 0 goto :not_admin

REM Check if NSSM is installed
where nssm >nul 2>&1
if %errorLevel% NEQ 0 goto :no_nssm

set PROJECT_ROOT=%~dp0
set SERVICE_NAME=TailorBillingApp
set POWERSHELL_PATH=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe
set SCRIPT_PATH=%PROJECT_ROOT%start-application-simple.ps1

echo Project Root: %PROJECT_ROOT%
echo Service Name: %SERVICE_NAME%
echo.

REM Remove existing service if it exists
echo Checking for existing service...
nssm status %SERVICE_NAME% >nul 2>&1
if %errorLevel% EQU 0 goto :remove_service
goto :install_service

:remove_service
echo Existing service found. Stopping and removing...
nssm stop %SERVICE_NAME%
timeout /t 2 /nobreak >nul
nssm remove %SERVICE_NAME% confirm
echo Service removed.
echo.

:install_service
REM Install the service
echo Installing Windows service...
nssm install %SERVICE_NAME% "%POWERSHELL_PATH%" "-ExecutionPolicy Bypass -NoProfile -File \"%SCRIPT_PATH%\""

if %errorLevel% NEQ 0 goto :install_failed

REM Configure service settings
echo Configuring service settings...
nssm set %SERVICE_NAME% AppDirectory "%PROJECT_ROOT%"
nssm set %SERVICE_NAME% DisplayName "Tailor Billing Application"
nssm set %SERVICE_NAME% Description "Tailor Billing Application - Auto-starting Django and React servers"
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START
nssm set %SERVICE_NAME% AppRestartDelay 5000
nssm set %SERVICE_NAME% AppExit Default Restart
nssm set %SERVICE_NAME% AppStdout "%PROJECT_ROOT%logs\service-output.log"
nssm set %SERVICE_NAME% AppStderr "%PROJECT_ROOT%logs\service-error.log"

REM Create logs directory
if not exist "%PROJECT_ROOT%logs" mkdir "%PROJECT_ROOT%logs"

REM Start the service
echo Starting service...
nssm start %SERVICE_NAME%

if %errorLevel% EQU 0 goto :success
goto :start_failed

:not_admin
echo ERROR: This script must be run as Administrator!
echo Right-click and select "Run as administrator"
pause
exit /b 1

:no_nssm
echo NSSM (Non-Sucking Service Manager) is not installed.
echo.
echo Please download NSSM from: https://nssm.cc/download
echo Extract it and add to your PATH, or place nssm.exe in this directory.
echo.
pause
exit /b 1

:install_failed
echo ERROR: Failed to install service!
pause
exit /b 1

:start_failed
echo.
echo ERROR: Service installed but failed to start!
echo Check the logs in: %PROJECT_ROOT%logs\
echo.
pause
exit /b 1

:success
echo.
echo ==========================================
echo Service installed and started successfully!
echo ==========================================
echo.
echo Service Name: %SERVICE_NAME%
echo.
echo Useful commands:
echo   Start service:   nssm start %SERVICE_NAME%
echo   Stop service:    nssm stop %SERVICE_NAME%
echo   Restart service: nssm restart %SERVICE_NAME%
echo   View status:     nssm status %SERVICE_NAME%
echo   View logs:       nssm edit %SERVICE_NAME%
echo.
echo The application will now start automatically on system boot!
echo.
pause
exit /b 0
