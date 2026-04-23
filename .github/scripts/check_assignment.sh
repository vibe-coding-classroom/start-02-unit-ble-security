#!/bin/bash

# start-02-unit-ble-security 專作檢查腳本

MODE=$1

check_files() {
    echo "Checking for essential files..."
    if [ -f "index.html" ] && [ -f "app.js" ] && [ -f "style.css" ]; then
        echo "✅ All essential files found."
        exit 0
    else
        echo "❌ Missing one or more essential files (index.html, app.js, style.css)."
        exit 1
    fi
}

check_security_logic() {
    echo "Checking for security and error handling logic in app.js..."
    
    # 檢查是否使用了 try...catch
    if grep -q "try" "app.js" && grep -q "catch" "app.js"; then
        echo "✅ Found try...catch blocks."
    else
        echo "❌ Error: app.js must include try...catch blocks for robust error handling."
        exit 1
    fi

    # 檢查是否處理了特定錯誤類型
    if grep -q "NotFoundError" "app.js"; then
        echo "✅ Found handling for NotFoundError (User Cancelled)."
    else
        echo "❌ Error: app.js should handle 'NotFoundError'."
        exit 1
    fi

    if grep -q "SecurityError" "app.js"; then
        echo "✅ Found handling for SecurityError."
    else
        echo "❌ Error: app.js should handle 'SecurityError'."
        exit 1
    fi

    echo "✅ Security logic check passed."
    exit 0
}

check_precision_filtering() {
    echo "Checking for precision filtering in requestDevice..."
    
    # 檢查是否有 filters 或 namePrefix 或 services
    if grep -q "filters" "app.js" || grep -q "namePrefix" "app.js" || grep -q "optionalServices" "app.js"; then
        echo "✅ Precision filtering configuration found."
        exit 0
    else
        echo "❌ Error: app.js should demonstrate precision filtering (filters, namePrefix, or optionalServices)."
        exit 1
    fi
}

check_screenshots() {
    echo "Checking for screenshots in screenshots/ directory..."
    
    # 檢查目錄是否存在且不為空 (排除 .gitkeep 等隱藏檔)
    FILE_COUNT=$(find screenshots -type f ! -name ".*" | wc -l)
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "✅ Found $FILE_COUNT screenshot(s)."
        exit 0
    else
        echo "❌ Error: screenshots/ directory is empty. Please upload cross-platform screenshots."
        exit 1
    fi
}

case $MODE in
    "files")
        check_files
        ;;
    "logic")
        check_security_logic
        ;;
    "filters")
        check_precision_filtering
        ;;
    "screenshots")
        check_screenshots
        ;;
    *)
        echo "Usage: $0 {files|logic|filters|screenshots}"
        exit 1
        ;;
esac
