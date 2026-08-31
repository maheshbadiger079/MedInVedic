@echo off
echo ==========================================
echo   MedInVedic FREE APK BUILDER
echo ==========================================
echo.
cd medinvedic_mobile_app
echo Phase 1: Cleaning...
call flutter clean
echo.
echo Phase 2: Building FREE APK...
call flutter build apk --release
echo.
if exist "build\app\outputs\flutter-apk\app-release.apk" (
    echo.
    echo SUCCESS! Your Free Android App is ready.
    echo.
    echo Copy this file:
    echo %cd%\build\app\outputs\flutter-apk\app-release.apk
    echo.
    echo To this location:
    echo ..\public\app\medinvedic.apk
    echo.
    echo Then run 'firebase deploy' and anyone can download it for FREE from your website!
) else (
    echo.
    echo ERROR: Build failed. Please ensure Flutter is installed.
)
pause
