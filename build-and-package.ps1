# Tvådje Build & Package Script

Write-Host "------------------------------------" -ForegroundColor Gold
Write-Host "Tvådje - Startar produktionsbygge..." -ForegroundColor Gold
Write-Host "------------------------------------"

# Kör Vite build
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBygget lyckades. Förbereder paket..." -ForegroundColor Green
    
    # Rensa gammal Dist-mapp om den finns
    if (Test-Path -Path "Dist") {
        Remove-Item -Path "Dist" -Recurse -Force
    }
    
    # Döp om 'dist' till 'Dist'
    Rename-Item -Path "dist" -NewName "Dist"
    
    # Skapa TAR-arkiv
    Write-Host "Skapar Dist.tar..." -ForegroundColor Cyan
    tar -cvf Dist.tar Dist
    
    Write-Host "`n------------------------------------" -ForegroundColor Green
    Write-Host "KLART! Dist.tar är redo för uppladdning." -ForegroundColor Green
    Write-Host "------------------------------------"
} else {
    Write-Host "`n------------------------------------" -ForegroundColor Red
    Write-Host "FEL: Bygget misslyckades!" -ForegroundColor Red
    Write-Host "------------------------------------"
    exit $LASTEXITCODE
}
