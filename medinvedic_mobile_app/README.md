# MedInVedic Mobile App (Flutter)

This directory contains the production-ready Flutter source code for the MedInVedic Android application.

## 🚀 Getting Started

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) installed.
- [Android Studio](https://developer.android.com/studio) or VS Code with Flutter extension.
- Java Development Kit (JDK) installed.

### 2. Setup
1. Open this folder in your terminal:
   ```bash
   cd medinvedic_mobile_app
   ```
2. Get dependencies:
   ```bash
   flutter pub get
   ```

### 3. Assets
Place your branding assets in the following paths:
- **App Icon**: `medinvedic_mobile_app/assets/icon/app_icon.png` (512x512 recommended)
- **Splash Logo**: `medinvedic_mobile_app/assets/splash/splash_logo.png`

Run these commands to generate icons and splash screens:
```bash
flutter pub run flutter_launcher_icons
flutter pub run flutter_native_splash:create
```

### 4. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (or use the existing MedInVedic one).
3. Add an Android App with package name: `com.medinvedic.app`.
4. Download `google-services.json` and place it in `medinvedic_mobile_app/android/app/`.

## 📦 Production Build (Google Play Ready)

### 1. Signing the App
1. Generate a keystore file:
   ```bash
   keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
2. Create `android/key.properties` and add details:
   ```properties
   storePassword=<your-password>
   keyPassword=<your-password>
   keyAlias=upload
   storeFile=<path-to-keystore>
   ```

### 2. Generate AAB (Android App Bundle)
Google Play requires `.aab` format for new apps.
```bash
flutter build appbundle --release
```
The file will be available at `build/app/outputs/bundle/release/app-release.aab`.

### 3. Generate APK (For direct installation)
```bash
flutter build apk --release
```

## 🛠️ Security & Optimizations
- **HTTPS Enforcement**: Only `https://medinvedic.web.app` and restricted domains are allowed.
- **Back Navigation**: Native Android back button is mapped to WebView history.
- **Permissions**: Automatically handles camera and storage permissions for uploads.
- **Performance**: High-speed caching enabled with `flutter_inappwebview`.

## 📄 Privacy Policy Template
Google Play requires a Privacy Policy. You can use this template:
[MedInVedic Privacy Policy](https://medinvedic.web.app/privacy-policy) (Ensure this page exists on your website).

---
**Goal**: Build a lightweight, fast, secure, and scalable Android app.
