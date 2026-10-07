import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distHtmlPath = path.join(rootDir, 'dist', 'index.html');

if (!fs.existsSync(distHtmlPath)) {
  console.error('❌ dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const html = fs.readFileSync(distHtmlPath, 'utf8');

// 1. Verify #root container exists
if (!html.includes('id="root"')) {
  console.error('❌ Missing #root container in dist/index.html!');
  process.exit(1);
}

// 2. Verify module script tag exists
const scriptMatch = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*>/);
if (!scriptMatch) {
  console.error('❌ Missing Vite module script in dist/index.html!');
  process.exit(1);
}

const mainBundlePath = path.join(rootDir, 'dist', scriptMatch[1].replace(/^\//, ''));
if (!fs.existsSync(mainBundlePath)) {
  console.error(`❌ Main bundle file ${scriptMatch[1]} missing from dist!`);
  process.exit(1);
}

// 3. Verify inline script tags syntax
const inlineScripts = [...html.matchAll(/<script(?![^>]*src)([\s\S]*?)>([\s\S]*?)<\/script>/gi)];
let hasError = false;

for (let i = 0; i < inlineScripts.length; i++) {
  const attrs = inlineScripts[i][1];
  const code = inlineScripts[i][2];

  // Skip JSON-LD scripts
  if (attrs.includes('application/ld+json')) {
    try {
      JSON.parse(code);
    } catch (e) {
      console.error(`❌ Invalid JSON-LD schema in script #${i}:`, e.message);
      hasError = true;
    }
    continue;
  }

  try {
    // Quick syntax verification using Function constructor
    new Function(code);
  } catch (e) {
    console.error(`❌ Syntax error in inline script #${i}:`, e.message);
    hasError = true;
  }
}

// 4. Verify sitemap.xml and ads.txt integrity
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error('❌ public/sitemap.xml missing!');
  hasError = true;
} else {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  if (!sitemapContent.includes('<urlset') || !sitemapContent.includes('</urlset>')) {
    console.error('❌ Invalid sitemap.xml structure!');
    hasError = true;
  }
}

const adsTxtPath = path.join(rootDir, 'public', 'ads.txt');
if (!fs.existsSync(adsTxtPath)) {
  console.error('❌ public/ads.txt missing!');
  hasError = true;
}

if (hasError) {
  console.error('🚨 Build validation failed! Do not deploy.');
  process.exit(1);
}

console.log('✅ Build validation passed: All scripts, bundles, sitemap, and ads.txt verified cleanly with 0 errors!');
