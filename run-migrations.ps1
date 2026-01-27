# Script to run Django migrations
# This should be run manually when you need to apply database changes

$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Django Migration Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend"
$venvPath = Join-Path $backendDir "venv"
$venvPython = Join-Path $venvPath "Scripts\python.exe"

# Check if virtual environment exists
if (-not (Test-Path $venvPython)) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run .\setup-backend.ps1 first to create the virtual environment." -ForegroundColor Yellow
    exit 1
}

Set-Location $backendDir

Write-Host "Using Python: $venvPython" -ForegroundColor Green
Write-Host "Working directory: $backendDir" -ForegroundColor Green
Write-Host ""

# Ask what to do
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Make migrations (create migration files)" -ForegroundColor Yellow
Write-Host "2. Apply migrations (run migrate)" -ForegroundColor Yellow
Write-Host "3. Both (make migrations then migrate)" -ForegroundColor Yellow
Write-Host "4. Show migration status" -ForegroundColor Yellow
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Making migrations..." -ForegroundColor Cyan
    & $venvPython manage.py makemigrations
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Migrations created successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Failed to create migrations!" -ForegroundColor Red
    }
}
elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "Applying migrations..." -ForegroundColor Cyan
    & $venvPython manage.py migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Migrations applied successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Failed to apply migrations!" -ForegroundColor Red
    }
}
elseif ($choice -eq "3") {
    Write-Host ""
    Write-Host "Making migrations..." -ForegroundColor Cyan
    & $venvPython manage.py makemigrations
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migrations created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Applying migrations..." -ForegroundColor Cyan
        & $venvPython manage.py migrate
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Migrations applied successfully!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Failed to apply migrations!" -ForegroundColor Red
        }
    } else {
        Write-Host ""
        Write-Host "Failed to create migrations!" -ForegroundColor Red
    }
}
elseif ($choice -eq "4") {
    Write-Host ""
    Write-Host "Migration status:" -ForegroundColor Cyan
    & $venvPython manage.py showmigrations
}
else {
    Write-Host ""
    Write-Host "Invalid choice!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
