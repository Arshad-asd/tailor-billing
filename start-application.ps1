# Tailor Billing Application Startup Script
# This script starts both the Django backend and React frontend servers

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Colors for output
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
Write-Info "Tailor Billing Application Startup"
Write-Info "=========================================="
Write-Info ""

# Check if Python is available
Write-Info "Checking Python installation..."
try {
    $pythonVersion = python --version 2>&1
    Write-Success "✓ Python found: $pythonVersion"
} catch {
    Write-Error "✗ Python not found. Please install Python first."
    exit 1
}

# Check if Node.js is available
Write-Info "Checking Node.js installation..."
try {
    $nodeVersion = node --version 2>&1
    Write-Success "✓ Node.js found: $nodeVersion"
} catch {
    Write-Error "✗ Node.js not found. Please install Node.js first."
    exit 1
}

# Check if PostgreSQL is running (optional check)
Write-Info "Checking database connection..."
$backendPath = Join-Path $projectRoot "backend"
$envFile = Join-Path $backendPath "core\.env"
if (Test-Path $envFile) {
    Write-Success "✓ Environment file found"
} else {
    Write-Error "✗ Environment file not found at: $envFile"
    exit 1
}

# Set working directories
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

# Function to start backend
function Start-Backend {
    Write-Info ""
    Write-Info "Starting Django Backend Server..."
    Set-Location $backendDir
    
    # Activate virtual environment if it exists
    $venvPath = Join-Path $backendDir "venv"
    if (Test-Path $venvPath) {
        Write-Info "Activating virtual environment..."
        & "$venvPath\Scripts\Activate.ps1"
    }
    
    # Start Django server
    Write-Info "Starting Django on http://localhost:8001"
    Start-Process python -ArgumentList "manage.py", "runserver", "0.0.0.0:8001" -WorkingDirectory $backendDir -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Success "✓ Backend server started"
}

# Function to start frontend
function Start-Frontend {
    Write-Info ""
    Write-Info "Starting React Frontend Server..."
    Set-Location $frontendDir
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Info "Installing frontend dependencies..."
        npm install
    }
    
    # Start Vite dev server
    Write-Info "Starting Vite on http://localhost:5173"
    Start-Process npm -ArgumentList "run", "dev" -WorkingDirectory $frontendDir -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Success "✓ Frontend server started"
}

# Start both services
try {
    Start-Backend
    Start-Frontend
    
    Write-Info ""
    Write-Success "=========================================="
    Write-Success "Application Started Successfully!"
    Write-Success "=========================================="
    Write-Info ""
    Write-Info "Backend API: http://localhost:8001"
    Write-Info "Frontend App: http://localhost:5173"
    Write-Info ""
    Write-Info "The application is now running in the background."
    Write-Info "To stop the application, use the stop script or Task Manager."
    Write-Info ""
    
    # Keep script running to monitor processes
    Write-Info "Monitoring services... (Press Ctrl+C to stop)"
    while ($true) {
        $backendProcess = Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*manage.py*" }
        $frontendProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe*" }
        
        if (-not $backendProcess) {
            Write-Error "Backend process stopped! Restarting..."
            Start-Backend
        }
        
        if (-not $frontendProcess) {
            Write-Error "Frontend process stopped! Restarting..."
            Start-Frontend
        }
        
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Error "Error starting application: $_"
    exit 1
}
