const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    senha: {
        type: String,
        required: true
    }
}, {
    // Adiciona automaticamente os campos createdAt e updatedAt
    timestamps: true
});

// Intercetador (Hook) atualizado para o padrão moderno (sem o 'next')
UserSchema.pre('save', async function () {
    // Só encripta se a senha foi modificada ou é um utilizador novo
    if (!this.isModified('senha')) {
        return; // Apenas retorna, encerrando a função
    }

    // O Mongoose moderno captura os erros de async automaticamente,
    // então podemos remover o try/catch e o next()
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
});

// Método da UML: +autenticar(): Boolean
UserSchema.methods.autenticar = async function (senhaFornecida) {
    return await bcrypt.compare(senhaFornecida, this.senha);
};

// Método da UML: +redefinirSenha(): void
UserSchema.methods.redefinirSenha = async function (novaSenha) {
    this.senha = novaSenha;
    await this.save(); // O pre-save hook acima vai encriptar esta nova senha automaticamente
};

module.exports = mongoose.model('User', UserSchema);