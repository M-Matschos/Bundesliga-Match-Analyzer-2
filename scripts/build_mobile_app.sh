#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Build Mobile App (.apk für Android, .ipa für iOS)
# Requires: Node.js, Expo CLI, EAS CLI
# ═══════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MOBILE_DIR="$PROJECT_ROOT/mobile"

echo "🚀 Starting Mobile App Build..."
echo "Project Root: $PROJECT_ROOT"
echo "Mobile Dir: $MOBILE_DIR"

# ─── Step 1: Check Prerequisites ────────────────────────────────────
echo ""
echo "📋 Step 1: Checking Prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo "✅ Node.js $(node -v) and npm $(npm -v) found"

# ─── Step 2: Install Dependencies ───────────────────────────────────
echo ""
echo "📦 Step 2: Installing Dependencies..."

cd "$MOBILE_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm ci --legacy-peer-deps
    echo "✅ Dependencies installed"
else
    echo "Dependencies already installed, running npm audit fix..."
    npm audit fix || true
fi

# ─── Step 3: Install EAS CLI ────────────────────────────────────────
echo ""
echo "🛠️  Step 3: Installing EAS CLI (if needed)..."

npm install -g eas-cli@latest

echo "✅ EAS CLI ready"

# ─── Step 4: Check eas.json Configuration ───────────────────────────
echo ""
echo "⚙️  Step 4: Checking EAS Configuration..."

if [ ! -f "$MOBILE_DIR/eas.json" ]; then
    echo "⚠️  eas.json not found. Creating default configuration..."
    cat > "$MOBILE_DIR/eas.json" << 'EOF'
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "TODO: add service account json path"
      },
      "ios": {
        "appleId": "TODO: add apple id"
      }
    }
  }
}
EOF
    echo "✅ eas.json created (update with your credentials for store submission)"
fi

# ─── Step 5: Build APK (Android) ────────────────────────────────────
echo ""
echo "📱 Step 5: Building Android APK..."

read -p "Build Android APK? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting Android build (this may take 5-10 minutes)..."
    eas build --platform android --non-interactive --profile preview
    echo "✅ Android APK built successfully!"
    echo "📥 Download APK from: https://expo.dev/builds"
fi

# ─── Step 6: Build IPA (iOS) ────────────────────────────────────────
echo ""
echo "🍎 Step 6: Building iOS IPA (macOS only)..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Build iOS IPA? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting iOS build (this may take 10-15 minutes)..."
        eas build --platform ios --non-interactive --profile preview
        echo "✅ iOS IPA built successfully!"
        echo "📥 Download IPA from: https://expo.dev/builds"
    fi
else
    echo "⚠️  iOS builds require macOS. You can build on macOS or use Expo Cloud Build."
fi

# ─── Step 7: Build Summary ──────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ MOBILE APP BUILD COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📦 Build Artifacts:"
echo "   Android: .apk file (installable on any Android device)"
echo "   iOS:     .ipa file (installable via TestFlight or Xcode)"
echo ""
echo "📥 Installation Instructions:"
echo "   Android: adb install app.apk"
echo "   iOS:     Use TestFlight or Xcode"
echo ""
echo "🔗 Next Steps:"
echo "   1. Download APK/IPA from https://expo.dev/builds"
echo "   2. Install on test devices"
echo "   3. Test user flows (Login → Dashboard → Weekend Calc)"
echo "   4. Collect feedback"
echo "   5. Submit to Google Play & App Store"
echo ""
echo "📱 For Production Release:"
echo "   - Update app.json: version, buildNumber"
echo "   - Configure Google Play and Apple Developer accounts"
echo "   - Create signing certificates"
echo "   - Run: eas build --platform android --profile production"
echo ""
echo "═══════════════════════════════════════════════════════════════"
