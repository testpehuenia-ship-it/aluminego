const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('.git') && !file.includes('node_modules') && !file.includes('.next') && !file.includes('gstack')) {
                results = results.concat(walk(file));
            }
        } else {
            if (!file.match(/\.(log|db|sqlite|pdf|png|jpg|jpeg|zip|tsbuildinfo)$/i)) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('.');
let updated = 0;
files.forEach(file => {
    if (file === 'fix.js') return;
    try {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content
            .replace(/PehueniaGo/gi, 'AlumineGo')
            .replace(/Villa Pehuenia Moquehue/gi, 'Aluminé')
            .replace(/Villa Pehuenia - Moquehue/gi, 'Aluminé')
            .replace(/Villa Pehuenia/gi, 'Aluminé')
            .replace(/Pehuenia/g, 'Aluminé')
            .replace(/pehuenia/g, 'alumine')
            // Fix corrupted UTF-8 encodings
            .replace(/Ã±/g, 'ñ')
            .replace(/Ã¡/g, 'á')
            .replace(/Ã©/g, 'é')
            .replace(/Ã­/g, 'í')
            .replace(/Ã³/g, 'ó')
            .replace(/Ãº/g, 'ú')
            .replace(/Ã‘/g, 'Ñ')
            .replace(/Ã /g, 'Á')
            .replace(/Ã‰/g, 'É')
            .replace(/Ã /g, 'Í')
            .replace(/Ã“/g, 'Ó')
            .replace(/Ãš/g, 'Ú')
            .replace(/Â¿/g, '¿')
            .replace(/Â¡/g, '¡');
        
        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            updated++;
        }
    } catch (e) {
    }
});
console.log('Fixed encodings and names in ' + updated + ' files.');
