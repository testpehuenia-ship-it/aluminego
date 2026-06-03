import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string) {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app');
files.forEach((file) => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes("from '@/lib/prisma'")) {
      console.log(`Actualizando: ${file}`);
      content = content.replace(/from '@\/lib\/prisma'/g, "from '@/lib/db'");
      fs.writeFileSync(file, content);
    }
  }
});
