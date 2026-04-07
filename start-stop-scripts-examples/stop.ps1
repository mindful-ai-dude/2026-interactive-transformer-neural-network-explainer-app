# ============================================================================
#  stop.ps1 — Windows Graceful Shutdown & Port Cleanup (PowerShell)
# ============================================================================
#  Usage:
#    .\stop.ps1                  Graceful shutdown
#    .\stop.ps1 -Force           Force kill
#    .\stop.ps1 -Port 3000       Kill processes on a specific port
# ============================================================================

param(
    [switch]$Force,
    [int]$Port = 0,
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\stop.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "  -Force         Force kill instead of graceful shutdown"
    Write-Host "  -Port <NUM>    Kill processes on a specific port"
    Write-Host "  -Help          Show this help message"
    exit 0
}

function Write-Info($msg)    { Write-Host "  i  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)      { Write-Host "  ✓  $msg" -ForegroundColor Green }
function Write-Warn($msg)    { Write-Host "  ⚠  $msg" -ForegroundColor Yellow }

# Load config
$APP_PORT = $Port
$APP_NAME = "Application"

if (Test-Path ".run.env") {
    Get-Content ".run.env" | ForEach-Object {
        if ($_ -match "^APP_PORT=(.+)$" -and $Port -eq 0) { $APP_PORT = [int]$Matches[1] }
        if ($_ -match "^APP_NAME=(.+)$") { $APP_NAME = $Matches[1] }
    }
}
if ($APP_PORT -eq 0) { $APP_PORT = 8000 }

Write-Host ""
Write-Host "Shutdown Script" -ForegroundColor Red
Write-Host ("─" * 60) -ForegroundColor DarkGray

# Find and kill processes on port
Write-Host ""
Write-Host "[Step 1] Stopping processes on port $APP_PORT" -ForegroundColor Blue

$connections = Get-NetTCPConnection -LocalPort $APP_PORT -ErrorAction SilentlyContinue
if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Info "Stopping $($proc.ProcessName) (PID $pid)..."
            if ($Force) {
                Stop-Process -Id $pid -Force
            } else {
                Stop-Process -Id $pid
                Start-Sleep -Seconds 2
                if (Get-Process -Id $pid -ErrorAction SilentlyContinue) {
                    Write-Warn "Graceful stop failed. Force killing..."
                    Stop-Process -Id $pid -Force
                }
            }
            Write-Ok "PID $pid stopped"
        }
    }
} else {
    Write-Info "No processes found on port $APP_PORT"
}

# Cleanup
Write-Host ""
Write-Host "[Step 2] Cleaning up" -ForegroundColor Blue

if (Test-Path ".run.env") {
    Remove-Item ".run.env" -Force
    Write-Ok "Removed .run.env"
}

# Verify
Write-Host ""
Write-Host "[Step 3] Verifying port $APP_PORT is free" -ForegroundColor Blue

Start-Sleep -Seconds 1
$remaining = Get-NetTCPConnection -LocalPort $APP_PORT -ErrorAction SilentlyContinue
if (-not $remaining) {
    Write-Ok "Port $APP_PORT is free and clear"
} else {
    Write-Warn "Port $APP_PORT still in use. Try: .\stop.ps1 -Force"
}

Write-Host ""
Write-Host "$APP_NAME has been shut down. Restart: .\start.ps1" -ForegroundColor Green
Write-Host ""
