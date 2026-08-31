@echo off
echo ==========================================
echo   MedInVedic Play Store Key Generator
echo ==========================================
echo.
echo This will generate your production signing key.
echo Please remember the password you enter (default is: medinvedic_upload).
echo.
keytool -genkey -v -keystore medinvedic-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload -storepass medinvedic_upload -keypass medinvedic_upload -dname "CN=MedInVedic, OU=IT, O=MedInVedic, L=Pune, S=Maharashtra, C=IN"
echo.
echo SUCCESS: medinvedic-upload-key.jks created.
echo Move this file to the root of MedInVedic folder or the path configured in key.properties.
pause
