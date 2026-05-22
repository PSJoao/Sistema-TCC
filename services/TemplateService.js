// services/TemplateService.js
const mammoth = require('mammoth');

/**
 * Serviço responsável pelo processamento de templates Word (.docx) e Texto (.txt)
 * preservando a formatação original através do armazenamento binário (Buffer).
 */
class TemplateService {
    /**
     * Processa um lote de ficheiros de template, extraindo as variáveis POR DOCUMENTO
     * e mantendo a estrutura binária original para o docxtemplater.
     * @param {Array} files - Ficheiros vindos do Multer (memoryStorage)
     * @returns {Promise<Object>} - Campos unificados, campos por documento e os buffers dos templates
     */
    async processarLoteTemplates(files) {
        const camposUnificados = new Set();
        const templatesProcessados = [];

        for (const file of files) {
            let textoBruto = '';
            const extensao = file.originalname.split('.').pop().toLowerCase();
            const camposDoDocumento = new Set();

            // 1. Extração de texto para mapeamento de variáveis
            if (extensao === 'docx') {
                // Extrai apenas o texto limpo (string) para o Regex, sem afetar o ficheiro original
                const resultado = await mammoth.extractRawText({ buffer: file.buffer });
                textoBruto = resultado.value;
            } else if (extensao === 'txt') {
                textoBruto = file.buffer.toString('utf-8');
            }

            // 2. Captura inteligente de variáveis usando Expressões Regulares (Regex)
            const regexChaves = /\{\{\s*([\s\S]+?)\s*\}\}/g;
            let match;

            while ((match = regexChaves.exec(textoBruto)) !== null) {
                const expressaoInterna = match[1].trim();
                const regexPalavras = /[a-zA-Z_][a-zA-Z0-9_]*/g;
                let palavraMatch;

                while ((palavraMatch = regexPalavras.exec(expressaoInterna)) !== null) {
                    const palavra = palavraMatch[0];

                    // Ignora a palavra reservada do nosso helper de cálculo
                    if (palavra !== 'calc') {
                        const campoNormalizado = palavra.toLowerCase();
                        camposUnificados.add(campoNormalizado);
                        camposDoDocumento.add(campoNormalizado);
                    }
                }
            }

            // 3. Preparação do modelo para o MongoDB
            // Guardamos o file.buffer (binário puro do Word) para manter 100% da formatação
            templatesProcessados.push({
                titulo: file.originalname.replace(/\.[^/.]+$/, ""), // Remove a extensão do título
                arquivo_original: file.buffer,
                campos: Array.from(camposDoDocumento) // Campos específicos deste documento
            });
        }

        return {
            fields: Array.from(camposUnificados),
            templatesData: templatesProcessados
        };
    }
}

module.exports = new TemplateService();