# Tailor Billing Application Stop Script
# This script stops both the Django backend and React frontend servers

$ErrorActionPreference = "Continue"

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

Write-Info "=========================================="
Write-Info "Stopping Tailor Billing Application"
Write-Info "=========================================="
Write-Info ""

# Stop Django backend processes
Write-Info "Stopping Django backend..."
$backendProcesses = Get-Process python -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like "*manage.py*" -or 
    $_.CommandLine -like "*runserver*" -or
    $_.Path -like "*python.exe*"
}

if ($backendProcesses) {
    foreach ($proc in $backendProcesses) {
        try {
            $proc | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Success "✓ Stopped Python process (PID: $($proc.Id))"
        } catch {
            Write-Error "✗ Failed to stop process (PID: $($proc.Id))"
        }
    }
} else {
    Write-Info "No Django backend processes found"
}

# Stop Node/Vite frontend processes
Write-Info "Stopping React frontend..."
$frontendProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object { 
    $_.Path -like "*node.exe*"
}

if ($frontendProcesses) {
    foreach ($proc in $frontendProcesses) {
        try {
            $proc | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Success "✓ Stopped Node process (PID: $($proc.Id))"
        } catch {
            Write-Error "✗ Failed to stop process (PID: $($proc.Id))"
        }
    }
} else {
    Write-Info "No Node.js frontend processes found"
}

# Stop any processes using the application ports
Write-Info "Checking for processes using application ports..."

# Port 8001 (Django)
$port8001 = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($port8001) {
    foreach ($pid in $port8001) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Success "✓ Stopped process using port 8001 (PID: $pid)"
        } catch {
            Write-Error "✗ Failed to stop process on port 8001 (PID: $pid)"
        }
    }
}

# Port 5173 (Vite)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($port5173) {
    foreach ($pid in $port5173) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Success "✓ Stopped process using port 5173 (PID: $pid)"
        } catch {
            Write-Error "✗ Failed to stop process on port 5173 (PID: $pid)"
        }
    }
}

Write-Info ""
Write-Success "=========================================="
Write-Success "Application Stopped"
Write-Success "=========================================="
Write-Info ""
