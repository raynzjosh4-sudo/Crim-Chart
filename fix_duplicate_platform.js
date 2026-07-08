const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'app', 'signup');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  if (c.match(/Platform.*Platform/)) {
    c = c.replace(/,\s*Platform\s*}\s*from\s*'react-native'/, "} from 'react-native'");
    fs.writeFileSync(p, c);
    console.log('Fixed duplicate Platform in ' + f);
  }
});
