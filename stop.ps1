# stop.ps1 - Stop the Transformer Explainer background services for Windows

# Navigate to the script's directory
Set-Location -Path $PSScriptRoot

if (Test-Path ".\.run.env") {
    # Extract the VITE_PID
    $envContent = Get-Content ".\.run.env"
    $pidLine = $envContent | Where-Object { $_ -match "^VITE_PID=" }
    
    if ($pidLine) {
        $processId = $pidLine.Split('=')[1]
        Write-Host "Stopping Vite development server (PID: $processId)..." -ForegroundColor Cyan
        
        # Stop process silently
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "Server stopped." -ForegroundColor Green
    } else {
        Write-Host "Could not find a valid Process ID in .run.env." -ForegroundColor Red
    }
    
    # Clean up
    Remove-Item ".\.run.env" -Force
} else {
    Write-Host "No .run.env file found. Is the server running?" -ForegroundColor Yellow
}
