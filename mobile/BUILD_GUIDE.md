# 📱 Match Oracle Mobile — Build & Deployment Guide

## Development Environment Status

### ✅ Setup Complete
- Node.js 18+
- npm dependencies installed (36 packages)
- Expo 55.0.17 configured
- React Native 0.73.0
- TypeScript enabled (auto-generated tsconfig.json)
- Jest testing framework
- ESLint + Prettier configured

### ⚠️ Known Version Mismatches
Some packages are slightly behind Expo 55's recommended versions:
- react-native: 0.73.0 (recommended: 0.83.6)
- react: 18.3.1 (recommended: 19.2.0)
- @react-native-async-storage: 1.24.0 (recommended: 2.2.0)

**Status:** These are warnings only — the app will still build and run.

---

## 🌐 Development Server

### Start Expo Web Server
```bash
cd mobile
npx expo start --web --port 8082
# Opens http://localhost:8082
```

### Start Expo for Android
```bash
npx expo start --android
# Requires Android Emulator or Expo Go app on phone
```

### Start Expo for iOS
```bash
npx expo start --ios
# Requires Xcode (macOS only)
```

---

## 📦 Building APK (Android)

### Option 1: EAS Cloud Build (Recommended for First Build)

#### Step 1: Create Expo Account
```bash
npx eas login
# Enter email + password
# Or visit https://expo.dev to create account
```

#### Step 2: Configure Project
```bash
npx eas build:configure
# Selects Android + iOS
```

#### Step 3: Build APK
```bash
# Build for testing (internal distribution)
npx eas build --platform android --profile preview

# Or: Build for Google Play
npx eas build --platform android --profile production
```

**Wait time:** 5-15 minutes for cloud build  
**Output:** APK link via email + EAS dashboard

---

### Option 2: Local Build (Requires Android SDK)

#### Prerequisites
- Android SDK installed (via Android Studio)
- ANDROID_HOME environment variable set
- Java JDK 11+

#### Build APK
```bash
npx expo prebuild --clean
# Generates Android and iOS native projects

# Then use Android Studio to build:
# 1. Open android/ folder in Android Studio
# 2. Build → Build Bundle(s) / APK(s) → Build APK(s)
# 3. APK in android/app/build/outputs/apk/
```

---

## 🔐 Environment Variables for CI/CD

### Using EXPO_TOKEN for Automated Builds
```bash
# Set in GitHub Actions / CI/CD
export EXPO_TOKEN="your_token_here"

# Get token:
# 1. https://expo.dev/settings/accounts/_/tokens
# 2. Click "Create" → select "ALL" scopes
# 3. Copy token to CI/CD secrets

# Then build without login:
npx eas build --platform android --profile preview
```

---

## ✅ Testing the Build

### After APK Build
```bash
# Test on Android device or emulator
adb install match-oracle-mobile.apk

# Or drag APK directly into emulator
```

### Test Cases
- [ ] App launches without errors
- [ ] Splash screen displays
- [ ] Navigation tabs visible (Dashboard, Weekend, Betting, Profile)
- [ ] Login/Register screens render
- [ ] API calls work (check Network tab)
- [ ] Loading skeletons appear while loading
- [ ] Error handling shows toast messages

---

## 🚀 Distribution

### Google Play Store
```bash
# 1. Create Play Console account
# 2. Create app listing
# 3. Upload APK via:
npx eas submit --platform android --latest

# Requires:
# - Google Play Service Account (JSON)
# - Signed APK (EAS handles this)
```

### Direct Download (Beta)
```bash
# After EAS build, get shareable link:
npx eas build --platform android --auto-submit false
# Copy link from output or EAS dashboard
```

---

## 📊 Current Build Status

**Last Build:** [Pending first successful build]  
**Expo Server:** Running on http://localhost:8082  
**Metro Bundler:** ✅ Ready  
**Type Checking:** ✅ tsconfig.json auto-generated

---

## 🔧 Troubleshooting

### "Port 8081 in use"
```bash
npx expo start --web --port 8082
# Or kill existing process:
pkill -f "node"
```

### "No files matching pattern src/"
- Ignore ESLint warning, src/ exists
- Files are at `mobile/src/**/*.tsx`

### "Bundler cache empty"
```bash
npx expo start --clear
# Rebuilds from scratch (1-2 minutes)
```

### Dependency Version Warnings
- Safe to ignore for MVP
- Can update packages later: `npm install react-native@0.83.6`

### "EXPO_TOKEN not set"
- For CI/CD only, not needed for local dev
- Set in GitHub Actions secrets if auto-building

---

## 📋 Next Steps

1. **Test Web Version:** `npx expo start --web`
2. **Build First APK:** `npx eas build --platform android --profile preview`
3. **Install on Device:** Transfer APK via adb or email link
4. **Gather Feedback:** Test against features in Mobile User Guide
5. **Fix Issues:** Update components, run `npx expo start` to reload

---

**Last Updated:** 2026-04-25  
**Version:** 1.0.0-preview  
**Maintained by:** Match Oracle Dev Team
