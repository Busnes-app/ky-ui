// Writes src/appmarks.js from the Busnes.app-site icon masters: the hand-drawn SVGs cropped
// to their badge, else icons/<name>.png downscaled to 64px (needs ImageMagick).
// Usage: node scripts/appmarks.mjs [--site=../Busnes.app-site]
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const site = resolve(process.argv.find(arg => arg.startsWith('--site='))?.slice(7) ?? join(root, '../Busnes.app-site'));
// KyIdentity client ID -> site icon name. Both KyMessage clients share the KyMessages mark.
const ids = {
  kypost: 'kypost', kycalendar: 'kycalendar', kydrive: 'kydrive', kynotes: 'kynotes',
  kymessage: 'kymessages', 'kymessage-chat': 'kymessages', kyidentity: 'kyidentity',
  kydns: 'kydns', kypulse: 'kypulse', kyrecovery: 'kyrecovery', kyyard: 'kyyard',
};

async function mark(name) {
  try {
    const svg = await readFile(join(site, `${name}-icon.svg`), 'utf8');
    const badge = svg
      .replace(/<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="163 162 927 928">')
      .replace(/<rect width="1254" height="1254"[^>]*\/>/, '')
      .replace(/>\s+</g, '><').trim();
    if (!badge.includes('viewBox="163 162 927 928"')) throw new Error(`${name}: unexpected SVG master`);
    return `data:image/svg+xml,${encodeURIComponent(badge)}`;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const png = execFileSync('magick', [join(site, 'icons', `${name}.png`), '-resize', '64x64', '-strip', '-define', 'png:compression-level=9', 'png:-']);
  return `data:image/png;base64,${png.toString('base64')}`;
}

const marks = await Promise.all(Object.entries(ids).map(async ([id, name]) => `  '${id}': '${await mark(name)}',`));
const template = await readFile(join(root, 'src/appmarks.js'), 'utf8');
const body = template.replace(/(export const appMarks = Object\.freeze\(\{\n)[\s\S]*?(\}\);)/, `$1${marks.join('\n')}\n$2`);
await writeFile(join(root, 'src/appmarks.js'), body);
console.log(`src/appmarks.js: ${Buffer.byteLength(body)} bytes`);
