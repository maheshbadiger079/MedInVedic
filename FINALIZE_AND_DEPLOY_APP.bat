@echo off
setlocal enabledelayedexpansion
echo ==================================================
echo   MedInVedic ULTIMATE APP AUTOMATOR (Free Launch)
echo ==================================================
echo.

set ROOT=%cd%
set APP_DIR=%ROOT%\medinvedic_mobile_app
set PUBLIC_APP=%ROOT%\public\app

echo 🧼 Step 0: Cleaning up old caches...
cd "%APP_DIR%"
call flutter clean
call flutter pub get
call flutter pub run flutter_launcher_icons:main

echo.
echo 🛠️ Step 1: Building Android APK (This takes a few minutes)...
call flutter build apk --release

if errorlevel 1 (
    echo.
    echo ❌ ERROR: Build failed. Please ensure Flutter is installed and key is generated.
    pause
    exit /b
)

echo.
echo 📁 Step 2: Preparing Public Assets...
if not exist "%PUBLIC_APP%" mkdir "%PUBLIC_APP%"

echo.
echo 🚚 Step 3: Moving APK to Website...
copy /Y "build\app\outputs\flutter-apk\app-release.apk" "%PUBLIC_APP%\medinvedic.apk"

echo 🚀 Step 4: Final Deployment...
call firebase deploy

echo.
echo ✅ SUCCESS! Your app and website are live.
echo.
echo Your website users can now download the app for free by clicking the link in the footer.
pause
