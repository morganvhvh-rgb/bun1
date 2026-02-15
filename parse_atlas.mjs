
import fs from 'fs';
import path from 'path';

const atlasPath = path.join(process.cwd(), 'public/Scroll.atlas');
const content = fs.readFileSync(atlasPath, 'utf-8');

const lines = content.split('\n');
const sprites = {};
let currentSprite = null;

for (const line of lines) {
    if (!line.startsWith(' ') && line.trim() && !line.includes(':')) {
        currentSprite = line.trim();
        sprites[currentSprite] = {};
    } else if (currentSprite && line.includes('xy:')) {
        const [x, y] = line.split('xy:')[1].split(',').map(s => parseInt(s.trim()));
        sprites[currentSprite].x = x;
        sprites[currentSprite].y = y;
    } else if (currentSprite && line.includes('size:')) {
        const [w, h] = line.split('size:')[1].split(',').map(s => parseInt(s.trim()));
        sprites[currentSprite].w = w;
        sprites[currentSprite].h = h;
    }
}

// Generate TS output
let output = 'export const SPRITES = {\n';
for (const [name, data] of Object.entries(sprites)) {
    if (name === 'Scroll.png') continue; // Skip header
    if (data.w !== 16 || data.h !== 16) continue; // Skip non-16x16 sprites
    output += `    "${name}": { x: ${data.x}, y: ${data.y}, w: ${data.w}, h: ${data.h} },\n`;
}
output += '} as const;';

console.log(output);
