const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUTPUT_DIR = __dirname;

function compileFile(filename) {
    const entryFile = path.join(SRC_DIR, filename);
    const outputFile = path.join(OUTPUT_DIR, filename);
    
    console.log(`Compiling ${filename}...`);
    try {
        let html = fs.readFileSync(entryFile, 'utf8');
        
        // Regex to match <!-- INCLUDE filepath -->
        const includeRegex = /<!--\s*INCLUDE\s+([^\s]+)\s*-->/g;
        
        let match;
        // Keep replacing until no more matches are found
        while ((match = includeRegex.exec(html)) !== null) {
            const placeholder = match[0];
            const relativePath = match[1];
            const absolutePath = path.join(SRC_DIR, relativePath);
            
            if (fs.existsSync(absolutePath)) {
                const componentContent = fs.readFileSync(absolutePath, 'utf8');
                html = html.replace(placeholder, componentContent);
                // Reset regex index because we modified the string length
                includeRegex.lastIndex = 0;
            } else {
                console.warn(`Warning: Component file not found at ${absolutePath}`);
                html = html.replace(placeholder, `<!-- ERROR: ${relativePath} not found -->`);
                includeRegex.lastIndex = 0;
            }
        }
        
        fs.writeFileSync(outputFile, html, 'utf8');
        console.log(`Successfully compiled: ${outputFile}`);
    } catch (error) {
        console.error(`Compilation error in ${filename}:`, error);
    }
}

function compileAll() {
    console.log('Starting full compilation...');
    try {
        const files = fs.readdirSync(SRC_DIR);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                compileFile(file);
            }
        });
        console.log('Full compilation complete!');
    } catch (error) {
        console.error('Error reading src directory:', error);
    }
}

// Run initial compile
compileAll();

// Watch mode
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
    console.log(`Watching for changes in ${SRC_DIR}...`);
    
    let debounceTimer;
    fs.watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
        if (filename) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                console.log(`File change detected: ${filename}`);
                // Normalise separators
                const normName = filename.replace(/\\/g, '/');
                if (normName.endsWith('.html')) {
                    // If it is in components, recompile all pages (since a component change affects all pages)
                    if (normName.includes('components/')) {
                        compileAll();
                    } else {
                        // Recompile just the changed root file
                        const baseName = path.basename(normName);
                        compileFile(baseName);
                    }
                } else {
                    // Non-html changes: just compile all
                    compileAll();
                }
            }, 100); // Debounce
        }
    });
}
