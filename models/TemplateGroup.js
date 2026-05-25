const mongoose = require('mongoose');

const TemplateGroupSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    id_mestra: { // Associa o template ao Workspace
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Grupos criados via upload começam como rascunho (true).
    // Só se tornam visíveis no dashboard quando o usuário clica "Finalizar" (false).
    rascunho: {
        type: Boolean,
        default: false
    },
    data_criacao: {
        type: Date,
        default: Date.now
    },
    permissoes: [{
        id_usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        pode_editar: {
            type: Boolean,
            default: false
        }
    }],
    deletado: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('TemplateGroup', TemplateGroupSchema);
