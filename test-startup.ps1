# Test script to verify the startup script works manually
# Run this first to see if there are any errors

$ErrorActionPreference = "Continue"

Write-Host "Testing Tailor Billing Startup Script..." -ForegroundColor Cyan
Write-Host ""

# Get script directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host "Backend Dir: $backendDir" -ForegroundColor Yellow
Write-Host "Frontend Dir: $frontendDir" -ForegroundColor Yellow
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found in PATH" -ForegroundColor Red
    Write-Host "  You may need to use full path to python.exe in the service" -ForegroundColor Yellow
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found in PATH" -ForegroundColor Red
    Write-Host "  You may need to use full path to node.exe in the service" -ForegroundColor Yellow
}

# Check directories
Write-Host ""
Write-Host "Checking directories..." -ForegroundColor Cyan
if (Test-Path $backendDir) {
    Write-Host "✓ Backend directory exists" -ForegroundColor Green
} else {
    Write-Host "✗ Backend directory not found" -ForegroundColor Red
}

if (Test-Path $frontendDir) {
    Write-Host "✓ Frontend directory exists" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend directory not found" -ForegroundColor Red
}

# Check manage.py
Write-Host ""
Write-Host "Checking Django..." -ForegroundColor Cyan
$managePy = Join-Path $backendDir "manage.py"
if (Test-Path $managePy) {
    Write-Host "✓ manage.py found" -ForegroundColor Green
} else {
    Write-Host "✗ manage.py not found" -ForegroundColor Red
}

# Check package.json
Write-Host ""
Write-Host "Checking Frontend..." -ForegroundColor Cyan
$packageJson = Join-Path $frontendDir "package.json"
if (Test-Path $packageJson) {
    Write-Host "✓ package.json found" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "If Python or Node.js are not found, you'll need to:" -ForegroundColor Yellow
Write-Host "1. Find their full paths (e.g., C:\Python\python.exe)" -ForegroundColor Yellow
Write-Host "2. Update the startup script to use full paths" -ForegroundColor Yellow
Write-Host ""
