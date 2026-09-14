$gitDir = "C:\Users\OMSAI\AppData\Local\GitHubDesktop\app-3.5.7\resources\app\git\cmd"
$gitBin = "C:\Users\OMSAI\AppData\Local\GitHubDesktop\app-3.5.7\resources\app\git\mingw64\bin"
$env:PATH = "$gitDir;$gitBin;$env:PATH"
Set-Location "d:\Learning Ai"

Write-Host "Checking git status..." -ForegroundColor Cyan
& "$gitDir\git.exe" status

Write-Host "Pushing main to GitHub repository..." -ForegroundColor Cyan
& "$gitDir\git.exe" push -u origin main
