const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'signing', 'components', 'signup-steps');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');

  // Fix desktopWrapper
  c = c.replace(/backgroundColor:\s*['"`]rgba\(255,\s*255,\s*255,\s*0\.02\)['"`]/g, "backgroundColor: 'transparent'");
  c = c.replace(/backgroundColor:\s*['"`]rgba\(255,255,255,0\.02\)['"`]/g, "backgroundColor: 'transparent'");

  // Fix desktopModal
  c = c.replace(/backgroundColor:\s*['"`]#16181c['"`]/g, "backgroundColor: colors.background");
  c = c.replace(/borderWidth:\s*1,?\s*/g, "borderWidth: 0,\n      ");
  c = c.replace(/borderColor:\s*['"`][^'"`]+['"`],?\s*/g, "");

  // Also some files might have different hardcoded colors, let's catch them if any
  fs.writeFileSync(p, c, 'utf8');
});
