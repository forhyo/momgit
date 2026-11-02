import { readFileSync, writeFileSync } from 'node:fs';

function restore(file, script) {
  let html = readFileSync(`dist/${file}`, 'utf8');
  html = html
    .replace(/\s*<script type="module" crossorigin src="[^"]*"><\/script>/g, '')
    .replace(/\s*<link rel="modulepreload"[^>]*>/g, '')
    .replace(/\s*<link rel="stylesheet" crossorigin href="[^"]*">/g, '');
  html = html.replace(/\s*<\/body>/, `\n    <script type="module" src="${script}"></script>\n  </body>`);
  writeFileSync(file, html, 'utf8');
  console.log(file, html.length);
}

restore('index.html', '/src/main.ts');
restore('help.html', '/src/static.ts');
restore('privacy.html', '/src/static.ts');
