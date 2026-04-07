# start.ps1 - Start the Transformer Explainer background services for Windows
$Port = 5173

# Navigate to the script's directory
Set-Location -Path $PSScriptRoot

Write-Host "Starting Node/Vite development server..." -ForegroundColor Cyan

# Start the process hidden
$process = Start-Process -FilePath "pnpm.cmd" -ArgumentList "dev --port $Port" -WindowStyle Hidden -PassThru

# Save the Process ID
Set-Content -Path ".\.run.env" -Value "VITE_PID=$($process.Id)"

Write-Host "Transformer Explainer is running in the background." -ForegroundColor Green
Write-Host "Access it at: http://localhost:$Port" -ForegroundColor Green
Write-Host "To stop the server, run: .\stop.ps1" -ForegroundColor Yellow
