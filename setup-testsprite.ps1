# TestSprite Environment Setup Script
Write-Host "Setting up TestSprite Environment Variables..." -ForegroundColor Green

# Set your TestSprite API key here
$env:TESTSPRITE_API_KEY = "YOUR_API_KEY_HERE"

# Set other TestSprite environment variables
$env:TESTSPRITE_PROJECT_PATH = "D:\IMS mise à jour\Projet final\gestion-textile-frontend-COMPLET\IMS-frontend"
$env:TESTSPRITE_LOCAL_PORT = "4200"
$env:TESTSPRITE_TYPE = "frontend"

Write-Host "TestSprite environment variables set:" -ForegroundColor Yellow
Write-Host "TESTSPRITE_API_KEY: $env:TESTSPRITE_API_KEY"
Write-Host "TESTSPRITE_PROJECT_PATH: $env:TESTSPRITE_PROJECT_PATH"
Write-Host "TESTSPRITE_LOCAL_PORT: $env:TESTSPRITE_LOCAL_PORT"
Write-Host "TESTSPRITE_TYPE: $env:TESTSPRITE_TYPE"

Write-Host "`nTo make these permanent, add them to your system environment variables." -ForegroundColor Cyan
Write-Host "Or run this script before each testing session." -ForegroundColor Cyan

Read-Host "Press Enter to continue"
