const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'signing', 'components', 'signup-steps');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');

  // Fix cases like: () => onNext('xyz');
  c = c.replace(/\(\)\s*=>\s*onNext\('([^']+)'\);/g, "() => onNext('$1')");
  // Fix cases like: () => onBack();
  c = c.replace(/\(\)\s*=>\s*onBack\(\);/g, "() => onBack()");
  // Fix cases like: () => onClose?.();
  c = c.replace(/\(\)\s*=>\s*onClose\?\.\(\);/g, "() => onClose?.()");

  fs.writeFileSync(p, c, 'utf8');
});
