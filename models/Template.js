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
    data_criacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Template', TemplateSchema);