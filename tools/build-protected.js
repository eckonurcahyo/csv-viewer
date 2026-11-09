/**
 * Full Multi-Layer Protection Build Tool
 * 1. Obfuscates assets/js/app.js into assets/js/app.min.js
 * 2. Runs tools/obfuscator.php to generate encrypted index.php
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { execSync } = require('child_process');

const appJsPath = path.join(__dirname, '../assets/js/app.js');
const appMinJsPath = path.join(__dirname, '../assets/js/app.min.js');

console.log('[1/3] Mengobfuscasi JavaScript (app.js)...');
const appJsSource = fs.readFileSync(appJsPath, 'utf8');

const obfuscationResult = JavaScriptObfuscator.obfuscate(appJsSource, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    numbersToExpressions: true,
    simplify: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.8,
    deadCodeInjection: false,
    renameGlobals: false
});

fs.writeFileSync(appMinJsPath, obfuscationResult.getObfuscatedCode(), 'utf8');
console.log(`[1/3] Selesai! File app.min.js dibuat (${fs.statSync(appMinJsPath).size} bytes).`);

console.log('[2/3] Menjalankan PHP Obfuscator untuk index.php...');
const phpOutput = execSync('php tools/obfuscator.php', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
console.log(phpOutput);

console.log('[3/3] Build proteksi selesai sempurna!');

