const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // A string de conexão virá do arquivo .env. 
        // Caso não encontre, ele tenta conectar localmente por padrão (fallback).
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/autodocs_tcc';

        await mongoose.connect(uri);
        console.log('Conexão com o MongoDB estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error.message);
        // Encerra a aplicação em caso de falha crítica no banco de dados
        process.exit(1);
    }
};

module.exports = connectDB;