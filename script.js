import * as Terser from 'terser';
import * as HTMLMinifier from 'html-minifier-terser';
import * as csso from 'csso';

// DOM Elements
const languageSelect = document.getElementById('language');
const minifyBtn = document.getElementById('minify-btn');
const copyBtn = document.getElementById('copy-btn');
const inputCode = document.getElementById('input-code');
const outputCode = document.getElementById('output-code');
const statsDiv = document.getElementById('stats');

// Minify Logic
const minifyCode = async () => {
    const code = inputCode.value;
    const language = languageSelect.value;
    
    if (!code.trim()) {
        outputCode.value = 'Por favor, insira algum código para minificar.';
        statsDiv.textContent = '';
        return;
    }

    try {
        let minifiedCode = '';
        minifyBtn.textContent = 'Minificando...';
        minifyBtn.disabled = true;

        switch (language) {
            case 'javascript':
                const jsResult = await Terser.minify(code, {
                    mangle: {
                        toplevel: true,
                    },
                });
                if (jsResult.error) {
                    throw jsResult.error;
                }
                minifiedCode = jsResult.code;
                break;
            case 'css':
                const cssResult = csso.minify(code);
                minifiedCode = cssResult.css;
                break;
            case 'html':
                minifiedCode = await HTMLMinifier.minify(code, {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true,
                    minifyCSS: true,
                });
                break;
        }

        outputCode.value = minifiedCode;
        calculateStats(code, minifiedCode);
        
    } catch (error) {
        outputCode.value = `Ocorreu um erro:\n\n${error.message}`;
        statsDiv.textContent = '';
    } finally {
        minifyBtn.textContent = 'Minificar';
        minifyBtn.disabled = false;
    }
};

// Calculate and display stats
const calculateStats = (original, minified) => {
    const originalSize = new Blob([original]).size;
    const minifiedSize = new Blob([minified]).size;
    
    if (originalSize === 0) {
        statsDiv.textContent = '';
        return;
    }

    const reduction = originalSize - minifiedSize;
    const percentage = ((reduction / originalSize) * 100).toFixed(2);
    
    statsDiv.textContent = `Tamanho original: ${formatBytes(originalSize)} | Tamanho minificado: ${formatBytes(minifiedSize)} | Redução: ${formatBytes(reduction)} (${percentage}%)`;
};

// Format bytes to a readable string
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// Copy to clipboard
const copyToClipboard = () => {
    if (!outputCode.value) return;
    navigator.clipboard.writeText(outputCode.value).then(() => {
        copyBtn.textContent = 'Copiado!';
        setTimeout(() => {
            copyBtn.textContent = 'Copiar';
        }, 2000);
    }).catch(err => {
        console.error('Falha ao copiar: ', err);
    });
};

// Event Listeners
minifyBtn.addEventListener('click', minifyCode);
copyBtn.addEventListener('click', copyToClipboard);


