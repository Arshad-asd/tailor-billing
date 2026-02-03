@echo off
REM Wrapper for NSSM: ensures correct working directory and logs service start
set "WRAPPER_LOG=C:\Windows\Temp\tailor-billing-wrapper.log"
REM Write immediately so we know the wrapper ran (use redirection that works as SYSTEM)
(echo [%date% %time%] Wrapper started. cd /d "%~dp0") >> "%WRAPPER_LOG%" 2>&1
cd /d "%~dp0"
(echo [%date% %time%] Running PowerShell) >> "%WRAPPER_LOG%" 2>&1
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -ExecutionPolicy Bypass -NoProfile -File "%~dp0start-application-simple.ps1"
(echo [%date% %time%] PowerShell exited %errorLevel%) >> "%WRAPPER_LOG%" 2>&1
