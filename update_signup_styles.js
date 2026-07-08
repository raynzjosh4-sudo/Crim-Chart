const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app', 'signup');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== '_layout.tsx');

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace colors.background in Styles object
  content = content.replace(/backgroundColor:\s*colors\.background/g, "backgroundColor: Platform.OS === 'web' ? 'transparent' : colors.background");
  
  // Make sure Platform is imported
  if (!content.includes('import { Platform')) {
    if (content.includes("from 'react-native'")) {
      content = content.replace("from 'react-native'", ", Platform } from 'react-native'");
    } else {
      content = "import { Platform } from 'react-native';\n" + content;
    }
  }

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated ' + f);
});
