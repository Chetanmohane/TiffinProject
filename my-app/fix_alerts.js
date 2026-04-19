const fs = require('fs');
const files = [
  'app/admin/customers/page.tsx',
  'app/admin/pause/page.tsx',
  'app/admin/payments/page.tsx',
  'app/admin/cancellations/page.tsx',
  'app/admin/menu/page.tsx',
  'app/customer/dashboard/payments/page.tsx',
  'app/customer/dashboard/plan/page.tsx',
  'app/customer/pause-meal/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    // Add toast import if missing
    if (!content.includes('react-hot-toast')) {
      const importInjectPoint = content.indexOf('import ');
      if (importInjectPoint !== -1) {
        content = content.substring(0, importInjectPoint) + 'import toast from "react-hot-toast";\n' + content.substring(importInjectPoint);
      }
    }
    
    // Replace alert string literals first for error/success differentiation
    // We match alert("something") or alert(`something`) or alert(var)
    // To be safe, we will replace alert("Success message") with toast.success
    // and alert("Error" or alert("Failed" with toast.error
    
    // Simple regex replacement:
    content = content.replace(/alert\((.*?(?:Failed|Error|Invalid).*?)\)/gi, 'toast.error($1)');
    content = content.replace(/alert\((.*?)\)/g, 'toast.success($1)');
    
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
