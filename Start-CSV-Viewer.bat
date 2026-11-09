@echo off
title CSV Viewer Pro Launcher
color 0A

echo ===================================================
echo           CSV Viewer Pro - Launcher
echo ===================================================
echo.

:: Check if port 80 is listening (Apache XAMPP)
netstat -ano | findstr /R ":80 " >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Apache XAMPP terdeteksi aktif pada port 80.
    echo [INFO] Membuka http://localhost/csv-viewer/ ...
    start "" "http://localhost/csv-viewer/"
    goto end
)

:: If Apache is not running, check if PHP is installed
where php >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Apache tidak aktif. Memulai PHP built-in server pada port 8080...
    start /B php -S localhost:8080 >nul 2>&1
    timeout /t 2 >nul
    echo [INFO] Membuka http://localhost:8080/ ...
    start "" "http://localhost:8080/"
    goto end
)

:: Fallback: Open index.html directly
echo [INFO] Membuka index.html langsung di peramban bawaan...
start "" "index.html"

:end
echo.
echo [SUKSES] CSV Viewer Pro telah berjalan.
timeout /t 3 >nul
exit

