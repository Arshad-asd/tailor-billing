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
set WRAPPER_PATH=%PROJECT_ROOT%wrapper-service.bat

echo Project Root: %PROJECT_ROOT%
echo Service Name: %SERVICE_NAME%
echo Wrapper: %WRAPPER_PATH%
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
REM Create PowerShell launcher in Temp (run PowerShell directly to avoid SERVICE_PAUSED with cmd.exe)
set LAUNCHER_PS1=%SystemRoot%\Temp\tailor-billing-launcher.ps1
set POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe
echo Creating launcher at %LAUNCHER_PS1%
del "%LAUNCHER_PS1%" 2>nul
echo $ErrorActionPreference = 'Continue' >> "%LAUNCHER_PS1%"
echo $projectRoot = '%PROJECT_ROOT%'.TrimEnd('\') >> "%LAUNCHER_PS1%"
echo Set-Location -LiteralPath $projectRoot >> "%LAUNCHER_PS1%"
echo ^& (Join-Path $projectRoot "start-application-simple.ps1") >> "%LAUNCHER_PS1%"
if not exist "%LAUNCHER_PS1%" goto :install_failed

REM Install the service to run PowerShell directly (avoids PAUSED state with cmd.exe)
echo Installing Windows service...
nssm install %SERVICE_NAME% "%POWERSHELL_EXE%"
if %errorLevel% NEQ 0 goto :install_failed
nssm set %SERVICE_NAME% AppParameters "-ExecutionPolicy Bypass -NoProfile -File \"%LAUNCHER_PS1%\""
if %errorLevel% NEQ 0 goto :install_failed

REM Configure service settings
echo Configuring service settings...
nssm set %SERVICE_NAME% AppDirectory "%SystemRoot%\Temp"
nssm set %SERVICE_NAME% DisplayName "Tailor Billing Application"
nssm set %SERVICE_NAME% Description "Tailor Billing Application - Auto-starting Django and React servers"
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START
nssm set %SERVICE_NAME% AppRestartDelay 5000
nssm set %SERVICE_NAME% AppExit Default Restart
REM Log to Temp so SYSTEM can write even if project folder is not accessible
nssm set %SERVICE_NAME% AppStdout "%SystemRoot%\Temp\tailor-billing-service-stdout.log"
nssm set %SERVICE_NAME% AppStderr "%SystemRoot%\Temp\tailor-billing-service-stderr.log"

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
echo Check: C:\Windows\Temp\tailor-billing-service-stdout.log
echo Check: C:\Windows\Temp\tailor-billing-service-stderr.log
echo If access denied, grant SYSTEM access to: %PROJECT_ROOT%
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
