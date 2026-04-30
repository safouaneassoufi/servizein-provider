const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'assets', 'icon_v2_source.svg');
const outPath = path.join(__dirname, '..', 'assets', 'icon.png');

const svg = fs.readFileSync(svgPath, 'utf-8');

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1024 },
});

const pngData = resvg.render();
const pngBuffer = pngData.asPng();

fs.writeFileSync(outPath, pngBuffer);

const stats = fs.statSync(outPath);
console.log(`icon.png written — ${(stats.size / 1024).toFixed(1)} KB`);
