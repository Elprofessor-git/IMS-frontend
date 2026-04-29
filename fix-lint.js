const fs = require('fs');
const path = require('path');

// Fonction pour lire récursivement tous les fichiers TypeScript
function readTsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules')) {
            results = results.concat(readTsFiles(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

// Fonction pour corriger un fichier
function fixFile(filePath) {
    console.log(`Fixing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Supprimer les console.log
    content = content.replace(/console\.log\([^)]*\);?\n?/g, '');

    // 2. Ajouter les types de retour manquants
    content = content.replace(/ngOnInit\(\)\s*{/g, 'ngOnInit(): void {');
    content = content.replace(/ngOnDestroy\(\)\s*{/g, 'ngOnDestroy(): void {');
    content = content.replace(/constructor\(\)\s*{}\n/g, 'constructor() { /* TODO: Implement */ }\n');

    // 3. Ajouter le préfixe I aux interfaces
    content = content.replace(/^export interface ([A-Z][a-zA-Z]*)/gm, 'export interface I$1');

    fs.writeFileSync(filePath, content);
}

// Exécuter les corrections
const srcPath = path.join(__dirname, 'src');
const files = readTsFiles(srcPath);
files.forEach(fixFile);

console.log('Corrections terminées. Veuillez vérifier les modifications et exécuter lint à nouveau.');
