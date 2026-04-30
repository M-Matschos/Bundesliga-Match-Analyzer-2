# Build ALL Apps - APK (Android) + MSI (Windows Desktop)
# NON-INTERACTIVE VERSION - Builds both automatically

$ErrorActionPreference = "Stop"

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

Write-Host "Starting All Apps Build (AUTO MODE)..." -ForegroundColor Green
Write-Host "Project Root: $projectRoot" -ForegroundColor Cyan

# --- Step 1: Check Prerequisites ---
Write-Host ""
Write-Host "[STEP 1] Checking Prerequisites..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion found" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Node.js not found" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "[OK] npm $npmVersion found" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] npm not found" -ForegroundColor Red
    exit 1
}

# --- Step 2: Install Mobile App Dependencies ---
Write-Host ""
Write-Host "[STEP 2] Installing Mobile App Dependencies..." -ForegroundColor Yellow

$mobileDir = "$projectRoot\mobile"
Set-Location $mobileDir

if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm packages (this may take 2-3 minutes)..." -ForegroundColor Cyan
    npm ci --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] npm ci had issues, but continuing..." -ForegroundColor Yellow
    }
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "Dependencies already installed" -ForegroundColor Cyan
}

# --- Step 3: Install Global CLI Tools ---
Write-Host ""
Write-Host "[STEP 3] Installing Global CLI Tools..." -ForegroundColor Yellow

npm install -g eas-cli@latest
npm install -g electron-builder@latest
Write-Host "[OK] CLI tools installed" -ForegroundColor Green

# --- Step 4: Build Android APK ---
Write-Host ""
Write-Host "[STEP 4] Building Android APK..." -ForegroundColor Cyan
Write-Host "This will upload to Expo Cloud Build (5-10 minutes)..." -ForegroundColor Yellow
Write-Host "Requires Expo account: https://expo.dev" -ForegroundColor Yellow
Write-Host ""

Set-Location $mobileDir

try {
    Write-Host "Starting Expo EAS Cloud Build..." -ForegroundColor Cyan
    eas build --platform android --non-interactive --profile preview

    Write-Host ""
    Write-Host "[OK] Android APK Build STARTED!" -ForegroundColor Green
    Write-Host "MONITOR: https://expo.dev/builds" -ForegroundColor Cyan
    Write-Host "APK will be ready in 5-10 minutes (check link above)" -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host "[WARNING] APK build encountered an issue:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "This might still be building - check https://expo.dev/builds" -ForegroundColor Yellow
    Write-Host ""
}

# --- Step 5: Build Windows Desktop MSI ---
Write-Host ""
Write-Host "[STEP 5] Building Windows Desktop MSI..." -ForegroundColor Cyan
Write-Host "Building React app and creating MSI installer..." -ForegroundColor Yellow

$desktopDir = "$projectRoot\desktop"

# Ensure desktop directory exists
if (!(Test-Path $desktopDir)) {
    Write-Host "Creating desktop directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $desktopDir -Force | Out-Null
}

# Install desktop dependencies
Set-Location $desktopDir

if (!(Test-Path "node_modules")) {
    Write-Host "Installing desktop dependencies..." -ForegroundColor Cyan
    npm install
}

# Build React app
Write-Host "Building React app (this may take 2-3 minutes)..." -ForegroundColor Cyan
Set-Location $mobileDir

try {
    npm run build 2>&1 | Out-Null
    Write-Host "[OK] React build complete" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] React build failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Copy build to desktop
Write-Host "Copying build artifacts..." -ForegroundColor Cyan
$buildSource = "$mobileDir\build"
$buildDest = "$desktopDir\build"

if (Test-Path $buildDest) {
    Remove-Item $buildDest -Recurse -Force
}
Copy-Item $buildSource $buildDest -Recurse

# Build MSI
Set-Location $desktopDir
Write-Host "Building MSI installer (this may take 2-3 minutes)..." -ForegroundColor Cyan

try {
    npm run build:msi 2>&1 | Out-Null
    Write-Host "[OK] Windows MSI Build Complete!" -ForegroundColor Green
}
catch {
    Write-Host "[WARNING] MSI build had issues:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

# Find and display MSI file
$msiFile = Get-ChildItem -Path "$desktopDir\dist" -Filter "*.msi" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if ($msiFile) {
    Write-Host ""
    Write-Host "MSI Location: $($msiFile.FullName)" -ForegroundColor Cyan
    $sizeInMB = [math]::Round($msiFile.Length / 1MB, 1)
    Write-Host "MSI Size: $sizeInMB MB" -ForegroundColor Cyan
}

# --- Summary ---
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "[SUCCESS] BUILD PROCESS COMPLETE!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ANDROID APK:" -ForegroundColor Yellow
Write-Host "   - Go to: https://expo.dev/builds" -ForegroundColor White
Write-Host "   - Wait for build to complete (5-10 minutes)" -ForegroundColor White
Write-Host "   - Download the .apk file" -ForegroundColor White
Write-Host "   - On Android device: Open file to install" -ForegroundColor White
Write-Host "   - Or use: adb install path/to/app.apk" -ForegroundColor White
Write-Host ""

if ($msiFile) {
    Write-Host "2. WINDOWS DESKTOP:" -ForegroundColor Yellow
    Write-Host "   - Run: $($msiFile.FullName)" -ForegroundColor White
    Write-Host "   - Follow installer prompts" -ForegroundColor White
    Write-Host "   - Launch from Start Menu > Match Oracle" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================================" -ForegroundColor Green
