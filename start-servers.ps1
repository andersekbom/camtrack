# CamTracker Deluxe - Start Both Servers
# This script starts the backend (Express) and frontend (Vite) servers concurrently

Write-Host "Starting CamTracker Deluxe servers..." -ForegroundColor Green

# Start backend server in new PowerShell window
Write-Host "Starting backend server (Express)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm start"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 2

# Start frontend server in new PowerShell window  
Write-Host "Starting frontend server (Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev"

Write-Host "`nBoth servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")