import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);

// Expo copies public/ wholesale. These folders are prototype/reference packs;
// the Expo app uses the bundled Mee catalog plus public/mee/PNG thumbnails.
await Promise.all([
  rm(new URL('mee/', dist), { recursive: true, force: true }),
  rm(new URL('mee-html/', dist), { recursive: true, force: true }),
  rm(new URL('lobby-assets/', dist), { recursive: true, force: true }),
  rm(new URL('hub-images/', dist), { recursive: true, force: true }),
  rm(new URL('art/', dist), { recursive: true, force: true }),
  rm(new URL('character/', dist), { recursive: true, force: true }),
]);

await mkdir(dist, { recursive: true });
await copyFile(new URL('index.html', dist), new URL('404.html', dist));
await writeFile(new URL('.nojekyll', dist), '');

console.log(`GitHub Pages artifact ready at ${join(dist.pathname)}.`);
