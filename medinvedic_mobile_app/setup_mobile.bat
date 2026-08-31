@echo off
echo [MedInVedic] Starting Mobile App Setup...
echo Checking Dependencies...
call flutter pub get
if %ERRORLEVEL% NEQ 0 (
    echo Error: Flutter not found or pub get failed. Please ensure Flutter is installed.
    pause
    exit /b
)

echo Generating Icons...
call flutter pub run flutter_launcher_icons
echo Generating Splash Screens...
call flutter pub run flutter_native_splash:create

echo [Success] App branding completed.
echo To run the app, use: flutter run
echo To build release bundle: flutter build appbundle --release
pause
