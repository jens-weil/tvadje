# Tvådje Build & Package Script

# Färgkonstanter för Windows PowerShell
$Gold = "Yellow"
$Green = "Green"
$Cyan = "Cyan"
$Red = "Red"

Write-Host "------------------------------------" -ForegroundColor $Gold
Write-Host "Tvådje - Startar produktionsbygge..." -ForegroundColor $Gold
Write-Host "------------------------------------"

# Kör Vite build (skapar normalt mappen 'dist')
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBygget lyckades. Förbereder paket..." -ForegroundColor $Green
    
    # 1. Rensa gammal Dist.tar om den finns
    if (Test-Path -Path "Dist.tar") {
        Remove-Item -Path "Dist.tar" -Force
    }

    # 2. Hantera mappen (Windows är case-insensitive, så vi flyttar via temp)
    if (Test-Path -Path "dist") {
        # Om 'Dist' redan finns, ta bort den
        if (Test-Path -Path "Dist" -PathType Container) {
             # Om det faktiskt är samma mapp (pga case-insensitivity), hoppa över radering
             # Men för säkerhets skull flyttar vi den
        }
        
        # Säker metod för att byta case på Windows: dist -> dist_tmp -> Dist
        Rename-Item -Path "dist" -NewName "dist_tmp"
        Rename-Item -Path "dist_tmp" -NewName "Dist"
    }
    
    # 3. Skapa TAR-arkiv (vi använder absoluta sökvägar internt för tar om behövs, men relativ bör funka nu)
    Write-Host "Skapar Dist.tar..." -ForegroundColor $Cyan
    tar -cvf Dist.tar Dist
    
    Write-Host "`n------------------------------------" -ForegroundColor $Green
    Write-Host "KLART! Dist.tar är redo för uppladdning." -ForegroundColor $Green
    Write-Host "------------------------------------"
} else {
    Write-Host "`n------------------------------------" -ForegroundColor $Red
    Write-Host "FEL: Bygget misslyckades!" -ForegroundColor $Red
    Write-Host "------------------------------------"
    exit $LASTEXITCODE
}
