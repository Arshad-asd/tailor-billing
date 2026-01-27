# Script to fix and reconfigure the service

$SERVICE_NAME = "TailorBillingApp"
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Fixing Tailor Billing Service..." -ForegroundColor Cyan

# Check if service exists
$service = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
if (-not $service) {
    Write-Host "Service not found. Please run install-service.bat first." -ForegroundColor Red
    exit 1
}

Write-Host "Service found. Reconfiguring..." -ForegroundColor Yellow

# Update service configuration
nssm set $SERVICE_NAME AppDirectory "$PROJECT_ROOT"
nssm set $SERVICE_NAME AppStdout "$PROJECT_ROOT\logs\service-output.log"
nssm set $SERVICE_NAME AppStderr "$PROJECT_ROOT\logs\service-error.log"
nssm set $SERVICE_NAME AppRotateFiles 1
nssm set $SERVICE_NAME AppRotateOnline 1
nssm set $SERVICE_NAME AppRotateSeconds 86400
nssm set $SERVICE_NAME AppRotateBytes 10485760

# Set service to run as current user (might need admin privileges)
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
Write-Host "Setting service to run as: $currentUser" -ForegroundColor Yellow
nssm set $SERVICE_NAME ObjectName "$currentUser" ""

# Ensure logs directory exists
if (-not (Test-Path "$PROJECT_ROOT\logs")) {
    New-Item -ItemType Directory -Path "$PROJECT_ROOT\logs" -Force | Out-Null
}

Write-Host ""
Write-Host "Service configuration updated!" -ForegroundColor Green
Write-Host ""
Write-Host "Try starting the service with: nssm start $SERVICE_NAME" -ForegroundColor Cyan
Write-Host "Or check the logs in: $PROJECT_ROOT\logs\" -ForegroundColor Cyan
