#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para buscar archivos recursivamente
function findFiles(dir, extension, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
            findFiles(filePath, extension, fileList);
        } else if (file.endsWith(extension)) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Archivos a excluir (backups y archivos old)
const excludePatterns = [
    '.backup.',
    'Old.',
    '.old.',
    'backup.',
    'testUtils.js' // Mantener este archivo como está
];

// Patrones de reemplazo
const patterns = [
    // URLs directas con comillas simples
    {
        pattern: /'http:\/\/localhost:5000\/api([^']*)'/g,
        replacement: '`${import.meta.env.VITE_API_BASE_URL}/api$1`'
    },
    // URLs directas con comillas dobles
    {
        pattern: /"http:\/\/localhost:5000\/api([^"]*)"/g,
        replacement: '`${import.meta.env.VITE_API_BASE_URL}/api$1`'
    },
    // URLs en template literals
    {
        pattern: /`http:\/\/localhost:5000\/api([^`]*)`/g,
        replacement: '`${import.meta.env.VITE_API_BASE_URL}/api$1`'
    },
    // baseURL en configuraciones de axios
    {
        pattern: /baseURL:\s*['"`]http:\/\/localhost:5000\/api['"`]/g,
        replacement: 'baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`'
    },
    // axios.get/post/put/delete directo con localhost
    {
        pattern: /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]http:\/\/localhost:5000\/api([^'"`]*)/g,
        replacement: 'axios.$1(`${import.meta.env.VITE_API_BASE_URL}/api$2'
    },
    // fetch directo con localhost
    {
        pattern: /fetch\s*\(\s*['"`]http:\/\/localhost:5000\/api([^'"`]*)/g,
        replacement: 'fetch(`${import.meta.env.VITE_API_BASE_URL}/api$1'
    }
];

// Archivos a procesar
const sourceDir = path.join(__dirname, 'src');
const jsFiles = findFiles(sourceDir, '.js');
const jsxFiles = findFiles(sourceDir, '.jsx');
const allFiles = [...jsFiles, ...jsxFiles].filter(file => {
    return !excludePatterns.some(pattern => file.includes(pattern));
});

console.log('🔍 Archivos a procesar:', allFiles.length);
console.log('🔄 Iniciando migración de endpoints...\n');

let totalChanges = 0;

allFiles.forEach(filePath => {
    const relativePath = path.relative(__dirname, filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanged = false;
    let changeCount = 0;
    
    patterns.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
            content = content.replace(pattern, replacement);
            changeCount += matches.length;
            fileChanged = true;
        }
    });
    
    if (fileChanged) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${relativePath} - ${changeCount} cambios`);
        totalChanges += changeCount;
    }
});

console.log(`\n🎉 Migración completada!`);
console.log(`📊 Total de cambios: ${totalChanges}`);
console.log(`📁 Archivos procesados: ${allFiles.length}`);

if (totalChanges > 0) {
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Revisa los cambios antes de hacer commit');
    console.log('2. Asegúrate de que VITE_API_BASE_URL esté configurado en todos los entornos');
    console.log('3. Haz rebuild de la aplicación: npm run build');
    console.log('4. Algunos archivos pueden necesitar import adicional de import.meta.env');
}
