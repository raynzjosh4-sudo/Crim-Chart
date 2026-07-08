const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'signing', 'components', 'signup-steps');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');

  c = c.replace(/style=\{isDesktop \? styles\.desktopWrapper : styles\.flexOne\}/g, "style={styles.flexOne}");
  c = c.replace(/style=\{\[styles\.content, isDesktop && styles\.desktopModal\]\}/g, "style={styles.content}");

  fs.writeFileSync(p, c, 'utf8');
});
