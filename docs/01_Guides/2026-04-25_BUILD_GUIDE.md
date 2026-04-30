# 📦 Build Guide — App Distribution

**Version:** v2.0-MVP  
**Target Platforms:** Android (.apk), iOS (.ipa), Windows (.msi)  
**Last Updated:** 2026-04-25

---

## 🚀 Quick Build

### Android (.apk) — 5 Minutes

```bash
# Requires: Node.js, npm, Expo CLI, EAS CLI
chmod +x scripts/build_mobile_app.sh
./scripts/build_mobile_app.sh

# Then select:
# 1. Build Android APK? → y
# Output: .apk file (ready to install on phones)
```

### iOS (.ipa) — macOS Only

```bash
# Run on macOS
./scripts/build_mobile_app.sh

# Then select:
# 1. Build iOS IPA? → y
# Output: .ipa file (TestFlight distribution)
```

### Windows Desktop (.msi) — Optional

```bash
# Requires: Windows, node-gyp, WiX Toolset
# Currently: Not implemented (React Native → Web wrapper)
# Recommendation: Use web app at https://app.matchoracle.com instead
```

---

## 📱 Android APK Build (Detailed)

### Prerequisites

```bash
# Install Node.js 18+
node --version  # v18.0.0 or higher

# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI
npm install -g eas-cli

# Verify installations
expo --version
eas --version
```

### Build Steps

```bash
cd mobile

# 1. Install dependencies
npm ci --legacy-peer-deps

# 2. Configure app version (app.json)
nano app.json
# Update:
# - "version": "1.0.0"
# - "buildNumber": 1
# - "versionCode": 1

# 3. Build APK via Expo
eas build --platform android --non-interactive --profile preview

# 4. Watch build progress
# Open: https://expo.dev/builds

# 5. Download APK when ready
# Link provided in terminal
```

### Install on Device

```bash
# Via adb (Android Debug Bridge)
adb install path/to/bundesliga-app.apk

# Or: Share APK link to device & tap to install
```

### Size & Requirements

| Metric | Value |
|--------|-------|
| APK Size | ~25-35 MB |
| Minimum Android | 8.0 (API 26) |
| Target Android | 14+ (API 34+) |
| RAM Required | 100 MB |

---

## 🍎 iOS IPA Build (macOS Only)

### Prerequisites (macOS)

```bash
# Install Xcode
# App Store → Search "Xcode" → Install (~12 GB)

# Or Command Line Tools only:
xcode-select --install

# Apple Developer Account
# 1. Go to https://developer.apple.com
# 2. Enroll in Developer Program ($99/year)
# 3. Create Certificates & Provisioning Profiles
```

### Build Steps

```bash
cd mobile

# 1. Install dependencies
npm ci --legacy-peer-deps

# 2. Configure Expo credentials
eas credentials

# 3. Build IPA
eas build --platform ios --non-interactive --profile preview

# 4. Download IPA from Expo
# https://expo.dev/builds
```

### Distribute via TestFlight

```bash
# Option 1: Automatic via EAS Submit
eas submit --platform ios --latest

# Option 2: Manual via Xcode
# Open .ipa in Xcode → Manage App Store Connect
```

### Size & Requirements

| Metric | Value |
|--------|-------|
| IPA Size | ~40-50 MB |
| Minimum iOS | 13.0 |
| Target iOS | 16+ |
| RAM Required | 150 MB |

---

## 🪟 Windows Desktop App (.msi)

### Current Status: Not Implemented

**Reason:** React Native doesn't natively support Windows desktop. Options:

#### Option 1: Web-Based Wrapper (Recommended)
```bash
# Use Electron to wrap the web app
# - Fastest to build
# - Shares 100% code with mobile
# - No code duplication

# Command (if implemented):
npm run build:electron
# Output: ./dist/matchoracle-setup.msi
```

#### Option 2: Rewrite for Windows Desktop
```
- Use WPF/XAML (Microsoft)
- Use .NET 8 + WinUI 3
- ~3 weeks development
- Duplicates mobile codebase
```

#### Option 3: Web App Only
```
- Keep as Progressive Web App (PWA)
- Works on all platforms
- No native app store
- Recommended for MVP
```

### Recommended: PWA + Web App

```bash
# Deploy web version
npm run build:web
npm run start:web

# Users access: https://app.matchoracle.com
# Works on: Desktop, tablet, mobile browsers
```

---

## 📊 Build Configuration Files

### app.json (Mobile)

```json
{
  "expo": {
    "name": "Match Oracle",
    "slug": "match-oracle",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.matchoracle.app"
    },
    "android": {
      "package": "com.matchoracle.app",
      "versionCode": 1,
      "permissions": ["INTERNET", "ACCESS_NETWORK_STATE"]
    }
  }
}
```

### eas.json (Build Configuration)

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "distribution": "store",
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

---

## 🎯 Release Checklist

### Before First Release

- [ ] Version number set (1.0.0)
- [ ] Build number incremented (1)
- [ ] All tests passing (npm test)
- [ ] No console warnings
- [ ] Performance profiled (< 2s load)
- [ ] Screenshots captured (1242×2208 px)
- [ ] Privacy policy written
- [ ] Terms of Service written
- [ ] API endpoints tested
- [ ] Database migrations tested

### Android Store Submission

- [ ] Google Play account created ($25)
- [ ] Bundle signing key generated
- [ ] App icon (512×512 px)
- [ ] Screenshots (2-5 per language)
- [ ] App description & privacy policy
- [ ] Content rating questionnaire
- [ ] Submit for review (~1-2 days)

### iOS App Store Submission

- [ ] Apple Developer account ($99/year)
- [ ] App ID created
- [ ] Provisioning profiles configured
- [ ] IPA signed with certificate
- [ ] App screenshots (1242×2208 px)
- [ ] App preview video (30 seconds)
- [ ] Privacy policy
- [ ] Age rating questionnaire
- [ ] Submit for review (~1-3 days)

---

## 🔄 Continuous Build Pipeline

### GitHub Actions Workflow

```yaml
name: Build Mobile App

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci --legacy-peer-deps
        working-directory: ./mobile

      - name: Run tests
        run: npm test
        working-directory: ./mobile

      - name: Build APK (preview)
        run: eas build --platform android --non-interactive --profile preview
        working-directory: ./mobile
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: apk
          path: mobile/dist/**/*.apk
```

---

## 📥 Distribution Options

### Option 1: Direct APK/IPA Download

```
✅ Pros:
  - No store submission delays
  - 100% control
  - Testing & feedback quickly

❌ Cons:
  - Manual installation process
  - No auto-updates
  - Not discoverable
```

### Option 2: Google Play Store

```
✅ Pros:
  - Highest reach (Android users)
  - Automatic updates
  - Payment integration ready

❌ Cons:
  - 1-2 day review process
  - $25 account fee
  - Content policies
```

### Option 3: Apple App Store

```
✅ Pros:
  - iOS user reach
  - High quality bar
  - Payment integration

❌ Cons:
  - 1-3 day review
  - $99/year developer fee
  - Strict policies
  - Rejection risk
```

### Option 4: TestFlight (Beta)

```
✅ Pros:
  - No review process
  - Perfect for beta testing
  - Up to 100 testers

❌ Cons:
  - Limited to 100 testers
  - Only available to beta users
  - Not for production
```

---

## 🚀 Recommended Launch Strategy

### Week 1: Closed Beta
```
- Build APK
- 20-50 internal testers
- Collect feedback
- Fix critical bugs
```

### Week 2: Open Beta
```
- TestFlight (iOS)
- Direct APK link (Android)
- 500 early access users
- Monitor crash logs
```

### Week 3: App Store Launch
```
- Submit to Google Play
- Submit to App Store
- Both approved simultaneously
- Public announcement
```

---

## 📞 Troubleshooting Builds

### Build Fails: "Module not found"

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm ci --legacy-peer-deps
```

### Build Fails: "Out of memory"

```bash
# Increase Node heap size
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### APK Won't Install

```bash
# Check Android version
adb shell getprop ro.build.version.release

# Verify APK target version in app.json
# Must match: targetSdkVersion >= device API
```

### Build Takes Too Long (> 15 min)

```
- EAS servers overloaded
- Check https://status.expo.io
- Retry in 30 minutes
- Or: Build locally via Android Studio
```

---

## 📊 App Metrics (Post-Launch)

Track in Google Play Console & App Store Connect:

```
- Installs per day
- Uninstall rate (target: < 5% in first 7 days)
- Crash rate (target: < 0.1%)
- Avg rating (target: 4.0+)
- User retention (day 1, 7, 30)
- Daily active users (DAU)
- Session length
- Feature usage
```

---

## 🎓 Next Steps

1. **Build APK**: `./scripts/build_mobile_app.sh` → Download APK
2. **Test on Devices**: Install on 5-10 phones/tablets
3. **Collect Feedback**: Use in-app feedback form
4. **Fix Bugs**: Address crash reports & UX issues
5. **Release to Beta**: TestFlight (iOS) + Direct APK (Android)
6. **Launch to Stores**: Google Play + App Store simultaneous

---

**Estimated Time to First Release:** 1-2 weeks (from today)

Ready to build? 🚀
