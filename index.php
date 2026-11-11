<?php
/**
 * ============================================================================
 * CSV Viewer Pro - Entry Point
 * 100% Offline Client-Side CSV to Excel Viewer & Converter
 * ============================================================================
 */

// Set security and UTF-8 encoding headers
header('Content-Type: text/html; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

$htmlFile = __DIR__ . '/index.html';

if (!file_exists($htmlFile)) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><body><h1>Error: index.html tidak ditemukan.</h1></body></html>';
    exit;
}

// Serve the clean index.html file
readfile($htmlFile);
exit;
