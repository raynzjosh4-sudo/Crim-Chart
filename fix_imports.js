const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'signing', 'components', 'signup-steps');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');

  c = c.replace(/import { StepProps } from '\.\.\/SignupModalWidget';/g, "import { StepProps } from '../signup.types';");

  fs.writeFileSync(p, c, 'utf8');
});
