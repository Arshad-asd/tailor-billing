# Fix SERVICE_PAUSED: Run Tailor Billing service under your user account.
# Run this script as Administrator. After this, the service will show RUNNING and auto-start after reboot.

$SERVICE_NAME = "TailorBillingApp"

# Require admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Run PowerShell as Administrator (right-click -> Run as administrator)." -ForegroundColor Red
    exit 1
}

# Check NSSM
$nssm = Get-Command nssm -ErrorAction SilentlyContinue
if (-not $nssm) {
    Write-Host "ERROR: NSSM not found. Install NSSM and add to PATH." -ForegroundColor Red
    exit 1
}

# Check service exists
$svc = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
if (-not $svc) {
    Write-Host "ERROR: Service $SERVICE_NAME not found. Run install-service.bat first." -ForegroundColor Red
    exit 1
}

$currentUser = $env:USERNAME
Write-Host ""
Write-Host "Fix PAUSED: Run service as your user account" -ForegroundColor Cyan
Write-Host "Current user: $currentUser" -ForegroundColor Yellow
Write-Host "Enter your Windows password (the one you use to sign in). It will not be shown." -ForegroundColor Yellow
Write-Host ""

$securePassword = Read-Host "Password" -AsSecureString
if ($securePassword.Length -eq 0) {
    Write-Host "No password entered. Exiting." -ForegroundColor Red
    exit 1
}

# Convert to plain text for nssm (nssm requires plain text)
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
} finally {
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

Write-Host "Setting service to run as .\$currentUser ..." -ForegroundColor Yellow
$result = & nssm set $SERVICE_NAME ObjectName ".\$currentUser" $plainPassword 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to set account: $result" -ForegroundColor Red
    exit 1
}
Write-Host "Service account set." -ForegroundColor Green

Write-Host "Stopping service..." -ForegroundColor Yellow
& nssm stop $SERVICE_NAME 2>&1 | Out-Null
Start-Sleep -Seconds 2

Write-Host "Starting service..." -ForegroundColor Yellow
& nssm start $SERVICE_NAME 2>&1 | Out-Null
Start-Sleep -Seconds 3

$status = & nssm status $SERVICE_NAME 2>&1
Write-Host ""
Write-Host "Service status: $status" -ForegroundColor $(if ($status -eq 'SERVICE_RUNNING') { 'Green' } else { 'Yellow' })
Write-Host ""
if ($status -eq 'SERVICE_RUNNING') {
    Write-Host "PAUSED is fixed. The service will now auto-start after reboot." -ForegroundColor Green
    Write-Host "Backend: http://localhost:8001  Frontend: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "If status is still PAUSED, check that your password is correct and run this script again." -ForegroundColor Yellow
}
Write-Host ""
