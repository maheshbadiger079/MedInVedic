@echo off
echo ==========================================
echo   MedInVedic Play Store Automator
echo ==========================================
echo.
cd medinvedic_mobile_app
echo Phase 1: Cleaning previous builds...
call flutter clean
echo.
echo Phase 2: Fetching dependencies...
call flutter pub get
echo.
echo Phase 3: Building Android App Bundle (AAB)...
call flutter build appbundle --release
echo.
if exist "build\app\outputs\bundle\release\app-release.aab" (
    echo.
    echo SUCCESS! Your Play Store package is ready:
    echo %cd%\build\app\outputs\bundle\release\app-release.aab
    echo.
    echo NEXT STEPS:
    echo 1. Open Google Play Console.
    echo 2. Upload the .aab file above.
) else (
    echo.
    echo ERROR: Build failed. Please ensure Flutter is installed and key is generated.
)
pause
