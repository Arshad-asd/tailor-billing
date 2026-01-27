# Setup script to create virtual environment and install dependencies

$ErrorActionPreference = "Continue"

Write-Host "Setting up Backend Environment..." -ForegroundColor Cyan
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend"
$venvPath = Join-Path $backendDir "venv"

# Check if venv already exists
if (Test-Path $venvPath) {
    Write-Host "Virtual environment already exists at: $venvPath" -ForegroundColor Yellow
    $response = Read-Host "Do you want to recreate it? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Removing existing virtual environment..." -ForegroundColor Yellow
        Remove-Item -Path $venvPath -Recurse -Force
    } else {
        Write-Host "Using existing virtual environment." -ForegroundColor Green
        $venvPython = Join-Path $venvPath "Scripts\python.exe"
        if (Test-Path $venvPython) {
            Write-Host "Installing/updating dependencies..." -ForegroundColor Cyan
            Set-Location $backendDir
            & $venvPython -m pip install --upgrade pip
            & $venvPython -m pip install -r requirements.txt
            Write-Host "Setup complete!" -ForegroundColor Green
            exit 0
        }
    }
}

# Find Python executable
$pythonExe = $null
$pythonPaths = @(
    "C:\Python313\python.exe",
    "C:\Users\USER\AppData\Local\Programs\Python\Python310\python.exe",
    "python.exe"
)

foreach ($path in $pythonPaths) {
    if (Test-Path $path) {
        $pythonExe = $path
        Write-Host "Using Python: $pythonExe" -ForegroundColor Green
        break
    }
}

if (-not $pythonExe) {
    try {
        $pythonExe = (Get-Command python -ErrorAction Stop).Source
        Write-Host "Using Python from PATH: $pythonExe" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Python not found! Please install Python first." -ForegroundColor Red
        exit 1
    }
}

# Create virtual environment
Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Cyan
Set-Location $backendDir

try {
    & $pythonExe -m venv venv
    if (-not (Test-Path $venvPath)) {
        Write-Host "ERROR: Failed to create virtual environment!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create virtual environment: $_" -ForegroundColor Red
    exit 1
}

# Activate and install dependencies
$venvPython = Join-Path $venvPath "Scripts\python.exe"
$venvPip = Join-Path $venvPath "Scripts\pip.exe"

Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Cyan
& $venvPython -m pip install --upgrade pip

Write-Host ""
Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Cyan
if (Test-Path "requirements.txt") {
    & $venvPython -m pip install -r requirements.txt
    Write-Host ""
    Write-Host "Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Virtual environment location: $venvPath" -ForegroundColor Cyan
    Write-Host "Python executable: $venvPython" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now restart the service with: nssm restart TailorBillingApp" -ForegroundColor Yellow
} else {
    Write-Host "WARNING: requirements.txt not found!" -ForegroundColor Yellow
    Write-Host "Installing Django and basic dependencies..." -ForegroundColor Cyan
    & $venvPython -m pip install django djangorestframework
    Write-Host "Setup complete, but you may need to install additional dependencies." -ForegroundColor Yellow
}
