const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'signing', 'components', 'signup-steps');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== '_layout.tsx');

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');

  // Add StepProps import
  if (!c.includes("import { StepProps }")) {
    c = "import { StepProps } from '../SignupModalWidget';\n" + c;
  }

  // Replace function signature
  c = c.replace(/export default function ([A-Za-z0-9_]+)\(\) {/, "export default function $1({ onNext, onBack, onClose }: StepProps) {");

  // Remove useRouter import
  c = c.replace(/import\s*{\s*useRouter(?:,\s*useFocusEffect)?\s*}\s*from\s*'expo-router';/g, "");
  c = c.replace(/import\s*{\s*useFocusEffect(?:,\s*useRouter)?\s*}\s*from\s*'expo-router';/g, "import { useFocusEffect } from 'expo-router';");

  // Remove const router = useRouter();
  c = c.replace(/const router = useRouter\(\);/g, "");

  // Replace routing calls
  // router.push('/signup/step' as any)
  c = c.replace(/router\.push\(['"`]\/signup\/([^'"`]+)['"`](?:\s*as\s*any)?\);?/g, "onNext('$1');");
  // router.replace('/signup/step' as any)
  c = c.replace(/router\.replace\(['"`]\/signup\/([^'"`]+)['"`](?:\s*as\s*any)?\);?/g, "onNext('$1');");

  // router.back()
  c = c.replace(/router\.back\(\);?/g, "onBack();");

  // router.push('/' as any) -> onClose?.()
  c = c.replace(/router\.push\(['"`]\/['"`](?:\s*as\s*any)?\);?/g, "onClose?.();");
  c = c.replace(/router\.replace\(['"`]\/['"`](?:\s*as\s*any)?\);?/g, "onClose?.();");

  // router.push('/(tabs)' as any) -> onClose?.()
  c = c.replace(/router\.push\(['"`]\/\(tabs\)['"`](?:\s*as\s*any)?\);?/g, "onClose?.();");
  c = c.replace(/router\.replace\(['"`]\/\(tabs\)['"`](?:\s*as\s*any)?\);?/g, "onClose?.();");

  // router.push('/login' as any) -> onNext('login')  (we can handle this specially in the wizard)
  c = c.replace(/router\.push\(['"`]\/login['"`](?:\s*as\s*any)?\);?/g, "onNext('login');");
  
  // router.push('/landing' as any) -> onClose?.()
  c = c.replace(/router\.push\(['"`]\/landing['"`](?:\s*as\s*any)?\);?/g, "onClose?.();");

  // router.push('/recover' as any) -> onNext('recover')
  c = c.replace(/router\.push\(['"`]\/recover['"`](?:\s*as\s*any)?\);?/g, "onNext('recover');");

  // router.push('/channel/create' as any) -> onClose?.()
  c = c.replace(/router\.push\(['"`]\/channel\/create['"`](?:\s*as\s*any)?\);?/g, "onClose?.();");

  fs.writeFileSync(p, c, 'utf8');
  console.log('Transformed ' + f);
});
