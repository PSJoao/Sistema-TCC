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
    data_criacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TemplateGroup', TemplateGroupSchema);
