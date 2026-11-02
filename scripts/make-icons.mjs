import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const svg = await readFile(fileURLToPath(new URL('../public/icons/icon.svg', import.meta.url)));
const out = (name) => fileURLToPath(new URL(`../public/icons/${name}`, import.meta.url));

await Promise.all([
  sharp(svg).resize(192, 192).png().toFile(out('icon-192.png')),
  sharp(svg).resize(512, 512).png().toFile(out('icon-512.png')),
  sharp(svg).resize(180, 180).png().toFile(out('apple-touch-icon.png')),
  sharp(svg).resize(32, 32).png().toFile(out('favicon-32.png')),
]);

console.log('icons: 192, 512, 180, 32 written');
