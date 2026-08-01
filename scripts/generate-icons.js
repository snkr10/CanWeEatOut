const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
const outPath = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');

sharp(svgPath, { density: 384 })
  .resize(180, 180)
  .png()
  .toFile(outPath)
  .then(() => console.log('Generated', outPath))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
