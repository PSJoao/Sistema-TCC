const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    // Agora salvamos o arquivo físico original (Binário) para não perder a formatação
    arquivo_original: {
        type: Buffer,
        required: true
    },
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Referência ao grupo que agrupa este template com outros do mesmo lote
    id_grupo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateGroup',
        required: true
    },
    // Campos (variáveis) extraídos deste documento específico
    campos: {
        type: [String],
        default: []
    },
    // Mapeamento campo → label customizado (editável pelo usuário)
    labels: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Mapeamento campo → placeholder customizado (editável pelo usuário)
    placeholders: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    data_criacao: {
        type: Date,
        default: Date.now
    },
    deletado: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Template', TemplateSchema);