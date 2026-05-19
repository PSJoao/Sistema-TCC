const mongoose = require('mongoose');

const DocumentoGeradoSchema = new mongoose.Schema({
    id_template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    },
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dados_variaveis: {
        // Tipo Mixed: Permite salvar qualquer estrutura JSON (Schema-on-read flexível)
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    arquivo_url: {
        type: String,
        // Opcional no momento da criação, pois o ficheiro físico pode ser gerado e salvo logo a seguir
        required: false
    },
    data_geracao: {
        type: Date,
        default: Date.now
    }
});

/**
 * Método da UML: +exportarPDF(): File
 * Previsão de arquitetura para a funcionalidade de exportação de PDF.
 */
DocumentoGeradoSchema.methods.exportarPDF = async function () {
    // Aqui entrará a lógica de conversão do HTML final para PDF 
    // (Pode ser integrado futuramente com bibliotecas como Puppeteer ou html-pdf-node)

    console.log(`Iniciando exportação de PDF para o documento referenciado: ${this._id}`);

    // Retorna o caminho simulado do ficheiro gerado para respeitar a assinatura do método
    return `/downloads/documento_${this._id}.pdf`;
};

module.exports = mongoose.model('DocumentoGerado', DocumentoGeradoSchema);