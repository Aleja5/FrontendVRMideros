const fs = require('fs');
const path = require('path');

// Directorios del frontend a limpiar
const directories = [
    './src/components',
    './src/pages',
    './src/hooks',
    './src/services',
    './src/utils'
];

// Patrones de console.log que MANTENER (estos son importantes)
const keepPatterns = [
    /console\.error\(/,           // Mantener console.error
    /console\.warn\(/,            // Mantener console.warn  
    /\/\/ REMOVED: console\.log/, // Ya fueron comentados
    /\/\/ DEBUG:/,                // Comentarios de debug
];

// Patrones que REMOVER (debug innecesarios)
const removePatterns = [
    /console\.log\(/
];

function shouldKeepLine(line) {
    // Si la línea contiene algún patrón que debemos mantener
    return keepPatterns.some(pattern => pattern.test(line));
}

function shouldRemoveLine(line) {
    // Si la línea contiene un patrón que debemos remover Y no está en la lista de mantener
    return removePatterns.some(pattern => pattern.test(line)) && !shouldKeepLine(line);
}

function cleanFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let removedCount = 0;
        
        const cleanedLines = lines.map(line => {
            if (shouldRemoveLine(line)) {
                removedCount++;
                // Comentar la línea en lugar de eliminarla completamente
                return line.replace(/(\s*)console\.log\(/, '$1// REMOVED: console.log(');
            }
            return line;
        });
        
        if (removedCount > 0) {
            fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
            console.log(`✅ ${path.basename(filePath)}: ${removedCount} console.log removidos`);
        }
    } catch (error) {
        console.error(`❌ Error procesando ${filePath}:`, error.message);
    }
}

function processDirectory(dir) {
    try {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                processDirectory(filePath);
            } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
                cleanFile(filePath);
            }
        });
    } catch (error) {
        console.error(`❌ Error procesando directorio ${dir}:`, error.message);
    }
}

// Ejecutar limpieza
console.log('🧹 Iniciando limpieza de console.log innecesarios en FRONTEND...\n');

directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`📁 Procesando: ${dir}`);
        processDirectory(dir);
    } else {
        console.log(`⚠️  Directorio no encontrado: ${dir}`);
    }
});

console.log('\n🎉 Limpieza de frontend completada');
console.log('ℹ️  Los console.log fueron comentados (no eliminados) para facilitar la revisión');
console.log('ℹ️  console.error y console.warn se mantuvieron intactos');
