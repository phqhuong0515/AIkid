import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);

// Expo copies public/ wholesale. Only runtime assets remain in the standalone
// app; trim large source-only image packs from the Pages artifact.
await Promise.all([
  rm(new URL('lobby-assets/', dist), { recursive: true, force: true }),
  rm(new URL('hub-images/', dist), { recursive: true, force: true }),
  rm(new URL('art-styles/', dist), { recursive: true, force: true }),
]);

await mkdir(dist, { recursive: true });
await copyFile(new URL('index.html', dist), new URL('404.html', dist));
await writeFile(new URL('.nojekyll', dist), '');

console.log(`GitHub Pages artifact ready at ${join(dist.pathname)}.`);
