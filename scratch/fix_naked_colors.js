const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('colors.')) return false; // fast path skip

  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
    });
  } catch (e) {
    console.error(`Failed to parse ${filePath}:`, e.message);
    return false;
  }

  let modified = false;
  let needsUseCurrentTheme = false;

  traverse(ast, {
    MemberExpression(p) {
      // Find `colors.X`
      if (
        t.isIdentifier(p.node.object, { name: 'colors' }) &&
        t.isIdentifier(p.node.property)
      ) {
        // Check if `colors` is bound in the scope (e.g. from useTheme() or themeStyles(colors))
        if (!p.scope.hasBinding('colors')) {
          // It's unbound! Change `colors.X` to `theme.colors.X`
          p.replaceWith(
            t.memberExpression(
              t.memberExpression(t.identifier('theme'), t.identifier('colors')),
              p.node.property
            )
          );
          modified = true;
          needsUseCurrentTheme = true;
        }
      }
    }
  });

  if (modified) {
    // If we changed anything, we might need to inject `const theme = useCurrentTheme();`
    let importedUseCurrentTheme = false;

    traverse(ast, {
      Program(p) {
        // Check if useCurrentTheme is already imported
        p.node.body.forEach(node => {
          if (t.isImportDeclaration(node) && node.source.value.includes('useThemeStore')) {
            node.specifiers.forEach(spec => {
              if (t.isImportSpecifier(spec) && spec.imported.name === 'useCurrentTheme') {
                importedUseCurrentTheme = true;
              }
            });
          }
        });

        if (needsUseCurrentTheme && !importedUseCurrentTheme) {
          const importDecl = t.importDeclaration(
            [t.importSpecifier(t.identifier('useCurrentTheme'), t.identifier('useCurrentTheme'))],
            t.stringLiteral('@/core/store/useThemeStore')
          );
          p.unshiftContainer('body', importDecl);
          importedUseCurrentTheme = true;
        }
      },
      
      // Inject `const theme = useCurrentTheme();` into the function component if it uses `theme.colors` and doesn't have `theme`
      MemberExpression(p) {
        if (
          t.isMemberExpression(p.node.object) &&
          t.isIdentifier(p.node.object.object, { name: 'theme' }) &&
          t.isIdentifier(p.node.object.property, { name: 'colors' })
        ) {
          // If `theme` is not bound, we must inject it
          if (!p.scope.hasBinding('theme')) {
            // Find the closest function scope
            const functionParent = p.getFunctionParent();
            if (functionParent && functionParent.node.body && t.isBlockStatement(functionParent.node.body)) {
              // check if we already injected it in this block
              const blockBody = functionParent.node.body.body;
              const hasThemeDec = blockBody.some(node => 
                t.isVariableDeclaration(node) && 
                node.declarations.some(d => t.isIdentifier(d.id, { name: 'theme' }))
              );
              
              if (!hasThemeDec) {
                const themeDec = t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.identifier('theme'),
                    t.callExpression(t.identifier('useCurrentTheme'), [])
                  )
                ]);
                functionParent.get('body').unshiftContainer('body', themeDec);
              }
            }
          }
        }
      }
    });

    const output = generate(ast, {}, content);
    fs.writeFileSync(filePath, output.code, 'utf8');
    return true;
  }
  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let changed = 0;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        changed += processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (fixFile(fullPath)) {
        changed++;
        console.log('Fixed', fullPath);
      }
    }
  }
  return changed;
}

const total = processDirectory(path.join(__dirname, '../src'));
console.log('Total files fixed:', total);
