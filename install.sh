#!/bin/bash

# Ma3mora Auditor Mobile App - Installation Script
# ===================================================

echo "📱 تثبيت تطبيق المراجع العام - معمورة"
echo "========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً من https://nodejs.org"
    exit 1
fi

echo "✅ Node.js مثبت: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت"
    exit 1
fi

echo "✅ npm مثبت: $(npm -v)"
echo ""

# Install dependencies
echo "📦 تثبيت المكتبات..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ تم تثبيت المكتبات بنجاح"
else
    echo "❌ فشل تثبيت المكتبات"
    exit 1
fi

echo ""
echo "🎉 تم التثبيت بنجاح!"
echo ""
echo "📖 الخطوات التالية:"
echo "  1. قم بتعديل رابط API في app.json"
echo "  2. شغّل التطبيق: npm start"
echo "  3. امسح QR Code من تطبيق Expo Go"
echo ""
echo "📚 لمزيد من المعلومات، راجع QUICKSTART.md"
echo ""

