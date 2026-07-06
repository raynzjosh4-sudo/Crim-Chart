const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let successCount = 0;

for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    if (!code.includes('StyleSheet.create') || !code.match(/#(FFF|fff|FFFFFF|ffffff|000|000000)/i)) continue;

    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });

        let hasUseStylesImport = false;
        let styleSheetObject = null;
        let styleSheetPath = null;
        let mainComponentPath = null;

        traverse(ast, {
            ImportDeclaration(p) {
                if (p.node.source.value.includes('useStyles')) {
                    hasUseStylesImport = true;
                }
            },
            VariableDeclarator(p) {
                if (p.node.id.name === 'styles' &&
                    p.node.init &&
                    p.node.init.type === 'CallExpression' &&
                    p.node.init.callee.type === 'MemberExpression' &&
                    p.node.init.callee.object.name === 'StyleSheet' &&
                    p.node.init.callee.property.name === 'create') {
                    
                    styleSheetObject = p.node.init.arguments[0];
                    styleSheetPath = p;
                }
            },
            ArrowFunctionExpression(p) {
                if (p.parent.type === 'VariableDeclarator' &&
                    /^[A-Z]/.test(p.parent.id.name)) {
                    let current = p.parentPath;
                    let isExport = false;
                    while(current) {
                        if (current.type === 'ExportNamedDeclaration' || current.type === 'ExportDefaultDeclaration') {
                            isExport = true;
                            break;
                        }
                        current = current.parentPath;
                    }
                    if (isExport) {
                        mainComponentPath = p;
                    }
                }
            },
            FunctionDeclaration(p) {
                if (p.node.id && /^[A-Z]/.test(p.node.id.name)) {
                    let current = p;
                    let isExport = false;
                    while(current) {
                        if (current.type === 'ExportNamedDeclaration' || current.type === 'ExportDefaultDeclaration') {
                            isExport = true;
                            break;
                        }
                        current = current.parentPath;
                    }
                    if (isExport) {
                        mainComponentPath = p;
                    }
                }
            }
        });

        if (styleSheetObject && mainComponentPath) {
            // Found both! Let's inject useStyles inside the component.
            // 1. Remove global styles
            styleSheetPath.parentPath.remove();

            // 2. Create `const styles = useStyles(colors => ({ ... }));`
            const useStylesCall = t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.identifier('styles'),
                    t.callExpression(t.identifier('useStyles'), [
                        t.arrowFunctionExpression(
                            [t.identifier('colors')],
                            styleSheetObject
                        )
                    ])
                )
            ]);

            // 3. Inject at top of component
            if (mainComponentPath.node.body.type === 'BlockStatement') {
                mainComponentPath.node.body.body.unshift(useStylesCall);
            } else {
                // It's an implicit return arrow function, wrap it in a block!
                const returned = mainComponentPath.node.body;
                mainComponentPath.node.body = t.blockStatement([
                    useStylesCall,
                    t.returnStatement(returned)
                ]);
            }

            // 4. Inject import if missing
            if (!hasUseStylesImport) {
                const importDecl = t.importDeclaration(
                    [t.importSpecifier(t.identifier('useStyles'), t.identifier('useStyles'))],
                    t.stringLiteral('@/core/hooks/useStyles')
                );
                ast.program.body.unshift(importDecl);
            }

            // 5. Replace colors
            traverse(ast, {
                StringLiteral(p) {
                    const val = p.node.value.toUpperCase();
                    if (val === '#000' || val === '#000000') {
                        // Very rough heuristic: if the key contains 'button', 'btn', 'action', it's primary. Else background.
                        let isBtn = false;
                        let current = p;
                        while(current && current.type !== 'ObjectProperty') {
                            current = current.parentPath;
                        }
                        if (current && current.node.key.name && /(btn|button|action)/i.test(current.node.key.name)) {
                            isBtn = true;
                        }
                        
                        p.replaceWith(t.memberExpression(t.identifier('colors'), t.identifier(isBtn ? 'primary' : 'background')));
                    } else if (val === '#FFF' || val === '#FFFFFF') {
                        let isBtn = false;
                        let current = p;
                        while(current && current.type !== 'ObjectProperty') {
                            current = current.parentPath;
                        }
                        if (current && current.node.key.name && /(btn|button|action)/i.test(current.node.key.name)) {
                            isBtn = true;
                        }
                        p.replaceWith(t.memberExpression(t.identifier('colors'), t.identifier(isBtn ? 'onPrimary' : 'text')));
                    }
                }
            });

            const newCode = generate(ast, { retainLines: false }).code;
            fs.writeFileSync(file, newCode, 'utf8');
            console.log('Transformed:', file);
            successCount++;
        }
    } catch (e) {
        // Syntax errors or unsupported files are skipped
    }
}
console.log('Successfully transformed', successCount, 'files.');
