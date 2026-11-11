<?php
/**
 * Clean & Safe Production Builder
 * Generates a clean, secure index.php entry point without heuristic virus triggers (No eval/base64).
 */

$inputFile = __DIR__ . '/../index.html';
$outputFile = __DIR__ . '/../index.php';

if (!file_exists($inputFile)) {
    die("Error: File index.html tidak ditemukan di {$inputFile}\n");
}

echo "[1/2] Membaca source index.html...\n";

$safePhp = <<<PHP
<?php
/**
 * ============================================================================
 * CSV Viewer Pro - Entry Point
 * 100% Offline Client-Side CSV to Excel Viewer & Converter
 * ============================================================================
 */

header('Content-Type: text/html; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

\$htmlFile = __DIR__ . '/index.html';

if (!file_exists(\$htmlFile)) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><body><h1>Error: index.html tidak ditemukan.</h1></body></html>';
    exit;
}

readfile(\$htmlFile);
exit;
PHP;

file_put_contents($outputFile, $safePhp);

echo "[2/2] Selesai! File index.php bersih dibuat (Bebas deteksi EDR/Antivirus).\n";
echo "Akses: http://localhost/csv-viewer/\n";
