const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const srcPath = path.join(process.cwd(), 'src', 'app');
const files = getAllFiles(srcPath);

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Match export interface IName
  const regex = /^export interface I([A-Z][a-zA-Z0-9]*)/gm;
  let match;
  const aliases = [];

  while ((match = regex.exec(content)) !== null) {
    const interfaceName = 'I' + match[1];
    const aliasName = match[1];
    
    // Check if alias already exists
    const aliasRegex = new RegExp(`export type ${aliasName} = ${interfaceName}`, 'g');
    if (!aliasRegex.test(content)) {
      aliases.push(`export type ${aliasName} = ${interfaceName};`);
      changed = true;
    }
  }

  if (changed) {
    console.log(`Adding aliases to ${filePath}`);
    content += '\n\n// Auto-generated aliases for backward compatibility\n' + aliases.join('\n') + '\n';
    fs.writeFileSync(filePath, content);
  }
});

console.log('Finished adding aliases.');
