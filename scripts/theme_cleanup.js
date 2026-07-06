const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir(srcDir, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace inside themeStyles
  if (content.includes('ThemeTokens') && content.includes('themeStyles')) {
    // We are inside a file that uses the standard themeStyles(colors, scale)
    
    // Replace text colors
    content = content.replace(/color:\s*['"]#(FFF|fff|FFFFFF|ffffff)['"]/g, 'color: colors.text');
    
    // Replace icon fill/color where possible (often just 'color')
    content = content.replace(/fill:\s*['"]#(FFF|fff|FFFFFF|ffffff)['"]/g, 'fill: colors.text');

    // Replace background colors (usually surface or background)
    content = content.replace(/backgroundColor:\s*['"]#(FFF|fff|FFFFFF|ffffff)['"]/g, 'backgroundColor: colors.surface');
    
    // Replace border colors
    content = content.replace(/borderColor:\s*['"]#(FFF|fff|FFFFFF|ffffff)['"]/g, 'borderColor: colors.surfaceVariant');
  }

  // 2. Replace inline styles if 'theme' is defined
  if (content.includes('useCurrentTheme()') || content.includes('theme = useTheme()') || content.includes('theme.')) {
    // `<Text style={{ color: '#FFF' }}>` -> `<Text style={{ color: theme.colors.text }}>`
    content = content.replace(/\{\{\s*color:\s*['"]#(FFF|fff|FFFFFF|ffffff)['"]/g, '{{ color: theme.colors.text');
    content = content.replace(/color:\s*['"]#(FFF|fff|FFFFFF|ffffff)['"]/g, "color: theme.colors.text");
  }

  // Same logic for black (#000) inside themeStyles -> should become text if we assume it was dark text on light mode. 
  // Wait, if it was #000 in a dark-mode-only app, it might have been background. Better leave #000 alone for now as #FFF is the main issue.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
    console.log(`Updated: ${filePath.replace(srcDir, '')}`);
  }
});

console.log(`\nCleanup complete! Modified ${modifiedCount} files.`);
