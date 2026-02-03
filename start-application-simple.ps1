# Simplified startup script for NSSM service
# This version runs both services and monitors them

$ErrorActionPreference = "Continue"

# Get script directory - more reliable method
$scriptPath = $MyInvocation.MyCommand.Path
if (-not $scriptPath) {
    $scriptPath = $PSCommandPath
}
if (-not $scriptPath) {
    $scriptPath = Get-Location
}

$projectRoot = Split-Path -Parent $scriptPath
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$logDir = Join-Path $projectRoot "logs"

# Create logs directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$logFile = Join-Path $logDir "startup.log"
$errorLogFile = Join-Path $logDir "startup-errors.log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    # Try to write with retry mechanism to handle file locking
    $maxRetries = 3
    $retryCount = 0
    $success = $false
    
    while ($retryCount -lt $maxRetries -and -not $success) {
        try {
            # Use file stream with append mode to avoid locking issues
            $stream = [System.IO.StreamWriter]::new($logFile, $true, [System.Text.Encoding]::UTF8)
            $stream.WriteLine($logMessage)
            $stream.Close()
            $success = $true
        }
        catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Start-Sleep -Milliseconds 100
            }
            else {
                # If all retries fail, just write to console
                Write-Host "WARNING: Could not write to log file: $_" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host $logMessage
}

function Write-ErrorLog {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] ERROR: $Message"
    
    # Try to write with retry mechanism to handle file locking
    $maxRetries = 3
    $retryCount = 0
    $success = $false
    
    while ($retryCount -lt $maxRetries -and -not $success) {
        try {
            # Use file stream with append mode to avoid locking issues
            $stream = [System.IO.StreamWriter]::new($errorLogFile, $true, [System.Text.Encoding]::UTF8)
            $stream.WriteLine($logMessage)
            $stream.Close()
            $success = $true
        }
        catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Start-Sleep -Milliseconds 100
            }
            else {
                # If all retries fail, just write to console
                Write-Host "WARNING: Could not write to error log file: $_" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host $logMessage -ForegroundColor Red
}

try {
    Write-Log "Starting Tailor Billing Application Service"
    Write-Log "Project Root: $projectRoot"
    Write-Log "Backend Dir: $backendDir"
    Write-Log "Frontend Dir: $frontendDir"
    
    # Set working directory
    Set-Location $projectRoot
    Write-Log "Changed to project root directory"
    
    # Check if directories exist
    if (-not (Test-Path $backendDir)) {
        Write-ErrorLog "Backend directory not found: $backendDir"
        exit 1
    }
    
    if (-not (Test-Path $frontendDir)) {
        Write-ErrorLog "Frontend directory not found: $frontendDir"
        exit 1
    }
    
    # Find Python executable - check for virtual environment first (most reliable)
    $pythonExe = $null
    $venvPath = Join-Path $backendDir "venv"
    $venvPython = Join-Path $venvPath "Scripts\python.exe"
    
    if (Test-Path $venvPython) {
        $pythonExe = $venvPython
        Write-Log "Using Python from virtual environment: $pythonExe"
    } else {
        # Try PATH first (works when Python is in system PATH)
        try {
            $pythonExe = (Get-Command python -ErrorAction Stop).Source
            Write-Log "Using Python from PATH: $pythonExe"
        } catch {
            # Try common locations (no username - works on any computer)
            $pythonPaths = @(
                "C:\Python313\python.exe",
                "C:\Python312\python.exe",
                "C:\Python311\python.exe",
                "C:\Python310\python.exe",
                (Join-Path $env:ProgramFiles "Python313\python.exe"),
                (Join-Path $env:ProgramFiles "Python312\python.exe"),
                (Join-Path $env:ProgramFiles "Python311\python.exe"),
                (Join-Path $env:LocalAppData "Programs\Python\Python313\python.exe"),
                (Join-Path $env:LocalAppData "Programs\Python\Python312\python.exe")
            )
            foreach ($path in $pythonPaths) {
                if ($path -and (Test-Path $path)) {
                    $pythonExe = $path
                    Write-Log "Using Python: $pythonExe"
                    break
                }
            }
        }
        if (-not $pythonExe) {
            Write-ErrorLog "Python not found! Create backend venv: cd backend; python -m venv venv; .\venv\Scripts\pip install -r requirements.txt"
            exit 1
        }
    }
    
    # Find Node.js executable - try PATH first, then common location
    $nodeExe = $null
    try {
        $nodeExe = (Get-Command node -ErrorAction Stop).Source
        Write-Log "Using Node.js from PATH: $nodeExe"
    } catch {
        $nodePaths = @(
            (Join-Path $env:ProgramFiles "nodejs\node.exe"),
            "C:\Program Files\nodejs\node.exe"
        )
        foreach ($path in $nodePaths) {
            if ($path -and (Test-Path $path)) {
                $nodeExe = $path
                Write-Log "Using Node.js: $nodeExe"
                break
            }
        }
    }
    if (-not $nodeExe) {
        Write-ErrorLog "Node.js not found! Install from https://nodejs.org and ensure it is in PATH."
        exit 1
    }
    
    # Start backend in a separate process
    Write-Log "Starting backend server..."
    $backendLogFile = Join-Path $logDir "backend-output.log"
    $backendErrorFile = Join-Path $logDir "backend-errors.log"
    $backendScript = @"
`$ErrorActionPreference = 'Continue'
Set-Location '$backendDir'
`$venvPath = Join-Path '$backendDir' 'venv'
if (Test-Path `$venvPath) {
    & `"`$venvPath\Scripts\Activate.ps1`"
}
try {
    & '$pythonExe' manage.py runserver 0.0.0.0:8001 2>&1 | Tee-Object -FilePath '$backendErrorFile'
} catch {
    `$_ | Out-File -FilePath '$backendErrorFile' -Append
    throw
}
"@
    
    $backendProcess = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-Command", $backendScript -PassThru -WindowStyle Hidden -WorkingDirectory $backendDir
    
    if (-not $backendProcess) {
        Write-ErrorLog "Failed to start backend process"
        exit 1
    }
    
    Write-Log "Backend process started with PID: $($backendProcess.Id)"
    
    # Wait a moment for backend to start and check if it's still running
    Start-Sleep -Seconds 5
    try {
        $proc = Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
        if (-not $proc -or $proc.HasExited) {
            Write-ErrorLog "Backend process exited immediately after start. Check backend-errors.log for details."
            if (Test-Path (Join-Path $logDir "backend-errors.log")) {
                $backendErrors = Get-Content (Join-Path $logDir "backend-errors.log") -Tail 10 -ErrorAction SilentlyContinue
                if ($backendErrors) {
                    Write-ErrorLog "Backend errors: $($backendErrors -join '; ')"
                }
            }
        } else {
            Write-Log "Backend process is running (PID: $($backendProcess.Id))"
        }
    } catch {
        Write-ErrorLog "Error checking backend process status: $_"
    }
    
    # Find npm executable (usually in same directory as node.exe)
    $npmExe = $null
    $nodeDir = Split-Path -Parent $nodeExe
    
    # Build npm paths array
    $npmPaths = @()
    if ($nodeDir) {
        $npmPaths += Join-Path $nodeDir "npm.cmd"
        $npmPaths += Join-Path $nodeDir "npm.exe"
    }
    $npmPaths += "npm.cmd"
    $npmPaths += "npm.exe"
    
    foreach ($path in $npmPaths) {
        if ($path -and (Test-Path $path)) {
            $npmExe = $path
            Write-Log "Using npm: $npmExe"
            break
        }
    }
    
    if (-not $npmExe) {
        try {
            $npmExe = (Get-Command npm -ErrorAction Stop).Source
            Write-Log "Using npm from PATH: $npmExe"
        } catch {
            Write-ErrorLog "npm not found! Please ensure Node.js is properly installed."
            exit 1
        }
    }
    
    # Start frontend in a separate process
    Write-Log "Starting frontend server..."
    $frontendScript = @"
Set-Location '$frontendDir'
if (-not (Test-Path 'node_modules')) {
    & '$npmExe' install
}
& '$npmExe' run dev
"@
    
    $frontendProcess = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-Command", $frontendScript -PassThru -WindowStyle Hidden -WorkingDirectory $frontendDir
    
    if (-not $frontendProcess) {
        Write-ErrorLog "Failed to start frontend process"
        exit 1
    }
    
    Write-Log "Frontend process started with PID: $($frontendProcess.Id)"
    Write-Log "Both services started successfully. Monitoring..."
    
    # Monitor both processes and restart if they crash
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Check backend
        try {
            $proc = Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
            if (-not $proc -or $proc.HasExited) {
                Write-Log "Backend process exited. Restarting..."
                $backendErrorFile = Join-Path $logDir "backend-errors.log"
                $backendErrorFile = Join-Path $logDir "backend-errors.log"
                $backendScript = @"
`$ErrorActionPreference = 'Continue'
Set-Location '$backendDir'
try {
    & '$pythonExe' manage.py runserver 0.0.0.0:8001 2>&1 | Tee-Object -FilePath '$backendErrorFile'
} catch {
    `$_ | Out-File -FilePath '$backendErrorFile' -Append
    throw
}
"@
                $backendProcess = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-Command", $backendScript -PassThru -WindowStyle Hidden -WorkingDirectory $backendDir
                if ($backendProcess) {
                    Write-Log "Backend restarted with PID: $($backendProcess.Id)"
                } else {
                    Write-ErrorLog "Failed to restart backend process"
                }
            }
        } catch {
            Write-ErrorLog "Error checking backend process: $_"
        }
        
        # Check frontend
        try {
            $proc = Get-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
            if (-not $proc -or $proc.HasExited) {
                Write-Log "Frontend process exited. Restarting..."
                $frontendScript = @"
Set-Location '$frontendDir'
if (-not (Test-Path 'node_modules')) {
    & '$npmExe' install
}
& '$npmExe' run dev
"@
                $frontendProcess = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy Bypass", "-Command", $frontendScript -PassThru -WindowStyle Hidden -WorkingDirectory $frontendDir
                if ($frontendProcess) {
                    Write-Log "Frontend restarted with PID: $($frontendProcess.Id)"
                } else {
                    Write-ErrorLog "Failed to restart frontend process"
                }
            }
        } catch {
            Write-ErrorLog "Error checking frontend process: $_"
        }
    }
} catch {
    Write-ErrorLog "Fatal error in startup script: $_"
    Write-ErrorLog "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}
