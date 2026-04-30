# ═══════════════════════════════════════════════════════════════════
# Build ALL Apps — APK (Android) + MSI (Windows Desktop)
# PowerShell Script for Windows
# ═══════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

Write-Host "🚀 Starting All Apps Build..." -ForegroundColor Green
Write-Host "Project Root: $projectRoot" -ForegroundColor Cyan

# ─── Step 1: Check Prerequisites ────────────────────────────────────
Write-Host ""
Write-Host "📋 Step 1: Checking Prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion found" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# ─── Step 2: Install Mobile App Dependencies ────────────────────────
Write-Host ""
Write-Host "📦 Step 2: Installing Mobile App Dependencies..." -ForegroundColor Yellow

$mobileDir = "$projectRoot\mobile"
Set-Location $mobileDir

if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Cyan
    npm ci --legacy-peer-deps
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "Dependencies already installed" -ForegroundColor Cyan
}

# ─── Step 3: Install Global CLI Tools ───────────────────────────────
Write-Host ""
Write-Host "🛠️  Step 3: Installing Global CLI Tools..." -ForegroundColor Yellow

npm install -g expo-cli@latest eas-cli@latest electron-builder@latest
Write-Host "✅ CLI tools installed" -ForegroundColor Green

# ─── Step 4: Build Android APK ──────────────────────────────────────
Write-Host ""
Write-Host "📱 Step 4: Building Android APK..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ This will upload to Expo Cloud Build & take 5-10 minutes..." -ForegroundColor Yellow
Write-Host "You need Expo account: https://expo.dev" -ForegroundColor Cyan
Write-Host ""

$buildAPK = Read-Host "Build Android APK? (y/n)"

if ($buildAPK -eq "y" -or $buildAPK -eq "Y") {
    Write-Host "Starting Expo Cloud Build for Android..." -ForegroundColor Cyan

    # Ensure we're in mobile directory
    Set-Location $mobileDir

    try {
        # Build APK via EAS
        eas build --platform android --non-interactive --profile preview

        Write-Host ""
        Write-Host "✅ Android APK Build Started!" -ForegroundColor Green
        Write-Host "📥 Watch progress at: https://expo.dev/builds" -ForegroundColor Cyan
        Write-Host "⏳ Build will complete in 5-10 minutes" -ForegroundColor Yellow
        Write-Host ""

        $downloadAPK = Read-Host "Continue to build Windows MSI? (y/n)"
        if ($downloadAPK -ne "y" -and $downloadAPK -ne "Y") {
            Write-Host ""
            Write-Host "👉 Download APK from: https://expo.dev/builds when ready" -ForegroundColor Cyan
            Write-Host "📌 Install with: adb install app.apk" -ForegroundColor Cyan
            exit 0
        }
    }
    catch {
        Write-Host "⚠️  APK Build Error (might still be building on Expo Cloud):" -ForegroundColor Yellow
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "👉 Check: https://expo.dev/builds" -ForegroundColor Cyan
    }
}

# ─── Step 5: Build Windows Desktop MSI ───────────────────────────────
Write-Host ""
Write-Host "🪟 Step 5: Building Windows Desktop MSI..." -ForegroundColor Cyan

$buildMSI = Read-Host "Build Windows MSI? (y/n)"

if ($buildMSI -eq "y" -or $buildMSI -eq "Y") {
    # Setup desktop directory
    $desktopDir = "$projectRoot\desktop"

    if (!(Test-Path $desktopDir)) {
        Write-Host "Creating desktop directory structure..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $desktopDir -Force | Out-Null

        # Copy package.json if not exists
        if (!(Test-Path "$desktopDir\package.json")) {
            Copy-Item "$projectRoot\desktop\package.json" "$desktopDir\" -Force
        }
    }

    # Install desktop dependencies
    Set-Location $desktopDir

    if (!(Test-Path "node_modules")) {
        Write-Host "Installing desktop dependencies..." -ForegroundColor Cyan
        npm ci
    }

    # Build React app
    Write-Host "Building React app..." -ForegroundColor Cyan
    Set-Location $mobileDir
    npm run build

    # Copy build to desktop
    Write-Host "Copying build to desktop directory..." -ForegroundColor Cyan
    $buildSource = "$mobileDir\build"
    $buildDest = "$desktopDir\build"

    if (Test-Path $buildDest) {
        Remove-Item $buildDest -Recurse -Force
    }
    Copy-Item $buildSource $buildDest -Recurse

    # Build MSI
    Set-Location $desktopDir
    Write-Host "Building Windows MSI Installer..." -ForegroundColor Cyan
    npm run build:msi

    Write-Host ""
    Write-Host "✅ Windows MSI Built Successfully!" -ForegroundColor Green

    # Find MSI file
    $msiFile = Get-ChildItem -Path "$desktopDir\dist" -Filter "*.msi" -Recurse | Select-Object -First 1

    if ($msiFile) {
        Write-Host "📦 MSI File: $($msiFile.FullName)" -ForegroundColor Cyan
        Write-Host "📊 Size: $([math]::Round($msiFile.Length / 1MB, 1)) MB" -ForegroundColor Cyan
    }
}

# ─── Step 6: Summary ────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ BUILD COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Build Artifacts:" -ForegroundColor Cyan
Write-Host "   Android: .apk file (from Expo Cloud Build)" -ForegroundColor Yellow
Write-Host "   Windows: Match Oracle Setup.msi (in desktop/dist/)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📥 Installation Instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Android:" -ForegroundColor Yellow
Write-Host "   1. Download APK from https://expo.dev/builds" -ForegroundColor White
Write-Host "   2. Enable 'Unknown sources' in Android settings" -ForegroundColor White
Write-Host "   3. Open APK file to install" -ForegroundColor White
Write-Host ""
Write-Host "   Windows:" -ForegroundColor Yellow
Write-Host "   1. Run: Match Oracle Setup.msi" -ForegroundColor White
Write-Host "   2. Follow installer prompts" -ForegroundColor White
Write-Host "   3. Click Start → Match Oracle to launch" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test on Android device" -ForegroundColor White
Write-Host "   2. Test on Windows desktop" -ForegroundColor White
Write-Host "   3. Collect user feedback" -ForegroundColor White
Write-Host "   4. Fix bugs & iterate" -ForegroundColor White
Write-Host "   5. Submit to app stores (Google Play + Microsoft Store)" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
