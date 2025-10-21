@echo off
REM Ma3mora Auditor Mobile App - Installation Script for Windows
REM ==============================================================

echo.
echo ======================================
echo تثبيت تطبيق المراجع العام - معمورة
echo ======================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً من https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js مثبت
node -v

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm غير مثبت
    pause
    exit /b 1
)

echo ✅ npm مثبت
npm -v
echo.

REM Install dependencies
echo 📦 تثبيت المكتبات...
echo.
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ✅ تم تثبيت المكتبات بنجاح
) else (
    echo.
    echo ❌ فشل تثبيت المكتبات
    pause
    exit /b 1
)

echo.
echo =================================
echo 🎉 تم التثبيت بنجاح!
echo =================================
echo.
echo 📖 الخطوات التالية:
echo   1. قم بتعديل رابط API في app.json
echo   2. شغّل التطبيق: npm start
echo   3. امسح QR Code من تطبيق Expo Go
echo.
echo 📚 لمزيد من المعلومات، راجع QUICKSTART.md
echo.
pause

