import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Generates an ultra-crisp, high-contrast, scalable vector favicon
 * tailored specifically for:
 * 1. Google Search snippet results (48x48, 96x96 circle/square crop on #ffffff white backgrounds)
 * 2. Browser tabs (16x16, 32x32 dark/light mode)
 * 3. Mobile home screen icons & PWA manifests (192x192, 512x512)
 *
 * Design: High-contrast rounded square badge featuring the iconic FreshCommits
 * code bracket '<' in tech cyan/navy with gold trim, intersecting with the
 * lush green growth sprout and commit node.
 */
const createFaviconSvg = (size = 512) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <!-- Background: Deep Tech Dark Slate for maximum contrast against white search results -->
    <linearGradient id="fc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1324" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#040D1A" />
    </linearGradient>

    <!-- Badge Rim Border: Metallic Gold fading into vibrant Emerald -->
    <linearGradient id="fc-rim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5D78E" />
      <stop offset="35%" stop-color="#D4AF37" />
      <stop offset="70%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#34D399" />
    </linearGradient>

    <!-- Code Bracket: Steel Cyan / Deep Tech Blue -->
    <linearGradient id="fc-bracket" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="40%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0F3B66" />
    </linearGradient>

    <!-- Metallic Gold Stroke -->
    <linearGradient id="fc-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Primary Top Sprout Leaf: Lush Emerald to Mint Green -->
    <linearGradient id="fc-leaf-top" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="50%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#34D399" />
    </linearGradient>

    <!-- Secondary Right Leaf: Vibrant Spring Lime Green -->
    <linearGradient id="fc-leaf-side" x1="0%" y1="50%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="60%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#6EE7B7" />
    </linearGradient>

    <!-- Center Sprout Stem -->
    <linearGradient id="fc-stem" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#047857" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>

    <!-- Commit Glow Filter -->
    <filter id="fc-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- 1. Background Badge: Rounded squircle with 12px gold/emerald border -->
  <rect x="18" y="18" width="476" height="476" rx="108" fill="url(#fc-bg)" stroke="url(#fc-rim)" stroke-width="14" />

  <!-- Inner subtle corner glow -->
  <rect x="26" y="26" width="460" height="460" rx="100" fill="none" stroke="#38BDF8" stroke-width="2" opacity="0.3" />

  <!-- 2. Code Bracket Element '<' (Left) with bold tech geometry -->
  <!-- Bracket Drop Shadow / 3D Bevel -->
  <path
    d="M192 118 L76 244 C68 252 68 266 76 274 L192 400 C198 406 207 407 213 401 L221 393 C227 387 226 378 220 372 L124 259 L220 146 C226 140 227 131 221 125 L213 117 C207 111 198 112 192 118 Z"
    fill="#040D1A"
    opacity="0.6"
  />
  <!-- Bracket Main Body with Gold Border -->
  <path
    d="M188 114 L72 240 C64 248 64 262 72 270 L188 396 C194 402 203 403 209 397 L217 389 C223 383 222 374 216 368 L120 255 L216 142 C222 136 223 127 217 121 L209 113 C203 107 194 108 188 114 Z"
    fill="url(#fc-bracket)"
    stroke="url(#fc-gold)"
    stroke-width="7"
    stroke-linejoin="round"
  />

  <!-- 3. Central Growth Stem / Branch -->
  <path
    d="M214 390 C226 330 256 265 284 195"
    stroke="url(#fc-stem)"
    stroke-width="22"
    stroke-linecap="round"
  />
  <path
    d="M214 390 C226 330 256 265 284 195"
    stroke="url(#fc-gold)"
    stroke-width="5"
    stroke-linecap="round"
    opacity="0.85"
  />

  <!-- 4. Top Primary Leaf (Reaching Upward) -->
  <path
    d="M280 200 C270 120 318 68 396 52 C404 135 348 195 280 200 Z"
    fill="url(#fc-leaf-top)"
    stroke="url(#fc-gold)"
    stroke-width="7"
    stroke-linejoin="round"
  />
  <!-- Top Leaf Spine Highlight -->
  <path
    d="M298 182 C326 142 364 102 390 62"
    stroke="#ECFDF5"
    stroke-width="5"
    stroke-linecap="round"
    opacity="0.9"
  />

  <!-- 5. Secondary Lateral Leaf (Blooming Right) -->
  <path
    d="M272 245 C324 228 390 236 436 280 C374 330 306 298 272 245 Z"
    fill="url(#fc-leaf-side)"
    stroke="url(#fc-gold)"
    stroke-width="7"
    stroke-linejoin="round"
  />
  <!-- Side Leaf Center Spine -->
  <path
    d="M288 255 C336 262 384 274 424 282"
    stroke="#ECFDF5"
    stroke-width="4.5"
    stroke-linecap="round"
    opacity="0.85"
  />

  <!-- 6. Glowing Git Commit Node at stem base -->
  <circle cx="214" cy="392" r="28" fill="#10B981" filter="url(#fc-glow)" />
  <circle cx="214" cy="392" r="20" fill="url(#fc-gold)" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="214" cy="392" r="8" fill="#040D1A" />
</svg>
`.trim();

async function generate() {
  const publicDir = path.resolve('public');
  const svgContent = createFaviconSvg();

  // Save master SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(publicDir, 'freshcommits-logo.svg'), svgContent);
  console.log('Saved master favicon.svg and freshcommits-logo.svg');

  const svgBuffer = Buffer.from(svgContent);

  // Exact sizes required for Googlebot-Favicon (multiples of 48px), Apple, and PWA
  const sizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-144x144.png', size: 144 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 }
  ];

  for (const item of sizes) {
    const outPath = path.join(publicDir, item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ Rendered ${item.name} (${item.size}x${item.size}px)`);
  }

  // Construct official binary multi-image ICO (16x16, 32x32, 48x48)
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = createIcoFromPngs([
    { buffer: png16, width: 16, height: 16 },
    { buffer: png32, width: 32, height: 32 },
    { buffer: png48, width: 48, height: 48 }
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Rendered multi-res /favicon.ico (16px, 32px, 48px)');
}

function createIcoFromPngs(images) {
  const count = images.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 for icon
  header.writeUInt16LE(count, 4); // number of images

  const buffers = [header];

  images.forEach((img, idx) => {
    const entryOffset = 6 + idx * 16;
    header.writeUInt8(img.width >= 256 ? 0 : img.width, entryOffset);
    header.writeUInt8(img.height >= 256 ? 0 : img.height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2); // color palette
    header.writeUInt8(0, entryOffset + 3); // reserved
    header.writeUInt16LE(1, entryOffset + 4); // color planes
    header.writeUInt16LE(32, entryOffset + 6); // bits per pixel
    header.writeUInt32LE(img.buffer.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);

    buffers.push(img.buffer);
    offset += img.buffer.length;
  });

  return Buffer.concat(buffers);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
