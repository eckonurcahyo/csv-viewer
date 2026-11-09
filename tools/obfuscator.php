<?php
/**
 * Professional PHP & Frontend Obfuscator Tool
 * Generates an encrypted & obfuscated index.php from index.html
 * 
 * Features:
 * 1. Anti-Inspect & Anti-DevTools Shield (Blocks F12, Ctrl+U, Right-Click, Ctrl+Shift+I, Ctrl+S)
 * 2. HTML Minification & Whitespace Compression
 * 3. Switches to heavily obfuscated assets/js/app.min.js
 * 4. Classic Server-Side PHP Packer (gzdeflate + base64 + scrambled vars + hex functions)
 * 5. Full UTF-8 support (No mojibake / corrupted emojis)
 */

$inputFile = __DIR__ . '/../index.html';
$outputFile = __DIR__ . '/../index.php';

if (!file_exists($inputFile)) {
    die("Error: File index.html tidak ditemukan di {$inputFile}\n");
}

$rawHtml = file_get_contents($inputFile);

echo "[1/4] Membaca source index.html (" . strlen($rawHtml) . " bytes)...\n";

// 1. Switch to obfuscated JS if available
if (file_exists(__DIR__ . '/../assets/js/app.min.js')) {
    $rawHtml = str_replace('assets/js/app.js', 'assets/js/app.min.js', $rawHtml);
    echo "[Info] Menggunakan file JS ter-obfuscate: assets/js/app.min.js\n";
}

// 2. Inject Comprehensive Anti-Inspect & Anti-DevTools Security Shield
$securityShield = <<<HTML
<script>
(function() {
  'use strict';
  // 1. Disable Right-Click Context Menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, false);

  // 2. Disable DevTools & View Source Shortcuts (F12, Ctrl+U, Ctrl+Shift+I/J/C, Ctrl+S)
  document.addEventListener('keydown', function(e) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
      (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, false);

  // 3. Clear console on load & prevent console inspection
  if (window.console) {
    try {
      console.clear();
      Object.defineProperty(window, 'console', {
        value: {
          log: function() {},
          warn: function() {},
          error: function() {},
          info: function() {},
          debug: function() {},
          clear: function() {}
        },
        writable: false,
        configurable: false
      });
    } catch(e) {}
  }
})();
</script>
HTML;

// Insert Security Shield just before </body>
$rawHtml = str_replace('</body>', $securityShield . "\n</body>", $rawHtml);

// 3. HTML Minification (Remove HTML comments, redundant spaces while preserving tags)
// Remove HTML comments
$minifiedHtml = preg_replace('/<!--(?!\s*(?:\[if [^\]]+]|<!|>))(?:(?!-->).)*-->/s', '', $rawHtml);
// Remove extra whitespace between tags
$minifiedHtml = preg_replace('/>\s+</', '><', $minifiedHtml);

echo "[2/4] Proteksi Anti-Inspect disuntikkan & HTML diminifikasi (" . strlen($minifiedHtml) . " bytes)...\n";

// 4. Classic PHP Obfuscator (gzdeflate + base64_encode + Scrambled Vars + Hex Functions)
$phpCodeToExecute = "<?php header('Content-Type: text/html; charset=UTF-8'); ?>" . $minifiedHtml;
$compressedData = gzdeflate($phpCodeToExecute, 9);
$encodedPayload = base64_encode($compressedData);

// Confusing variable names (Classic PHP Packer style)
$v_inflate = '$_0O0OO';
$v_decode  = '$_l11l1';
$v_data    = '$_1ll1l';
$v_runner  = '$_O0O0O';

// Hex-encoded function names
$hex_gzinflate     = '\x67\x7a\x69\x6e\x66\x6c\x61\x74\x65';
$hex_base64_decode = '\x62\x61\x73\x65\x36\x34\x5f\x64\x65\x63\x6f\x64\x65';

$obfuscatedPhp = "<?php\n";
$obfuscatedPhp .= "/* ==========================================================================\n";
$obfuscatedPhp .= " * CSV Viewer Pro - Encrypted & Obfuscated Runtime Build\n";
$obfuscatedPhp .= " * Protected by Multi-Layer Server & Client Obfuscator\n";
$obfuscatedPhp .= " * Generated: " . date('Y-m-d H:i:s') . "\n";
$obfuscatedPhp .= " * ========================================================================== */\n\n";

$obfuscatedPhp .= "{$v_inflate} = \"{$hex_gzinflate}\";\n";
$obfuscatedPhp .= "{$v_decode} = \"{$hex_base64_decode}\";\n";
$obfuscatedPhp .= "{$v_data} = \"{$encodedPayload}\";\n";
$obfuscatedPhp .= "eval(\"?>\" . {$v_inflate}({$v_decode}({$v_data})));\n";

echo "[3/4] Server-side PHP Obfuscator packer berhasil dikompilasi...\n";

// Write to index.php
file_put_contents($outputFile, $obfuscatedPhp);

echo "[4/4] Selesai! File berhasil disimpan di: {$outputFile} (" . strlen($obfuscatedPhp) . " bytes)\n";
echo "Silakan coba akses: http://localhost/csv-viewer/\n";
