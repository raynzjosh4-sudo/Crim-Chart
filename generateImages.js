const fs = require('fs');
const files = fs.readdirSync('c:/Users/user/Desktop/dev/crimchart/assets/music_images').filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
const content = `export const LocalMusicImages = [\n` +
  files.map(f => `  require("../assets/music_images/${f}")`).join(',\n') +
  `\n];\n`;
fs.writeFileSync('c:/Users/user/Desktop/dev/crimchart/src/assets_musicImages.ts', content);
