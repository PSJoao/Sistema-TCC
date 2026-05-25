// seed.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const criarUsuarioInicial = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/autodocs_tcc';

        console.log('Conectando ao banco para criar usuário inicial...');
        await mongoose.connect(uri);

        // Verifica se o usuário já existe para não duplicar
        const usuarioExistente = await User.findOne({ email: 'joao@teste.com' });
        if (usuarioExistente) {
            console.log('💡 Usuário inicial já cadastrado no banco!');
            process.exit(0);
        }

        // Instancia o novo usuário utilizando o Model do TCC
        const novoUsuario = new User({
            nome: 'João',
            email: 'joao@teste.com',
            senha: '123', // O hook 'pre-save' do nosso model vai encriptar isso automaticamente!
            cargo: 'mestra',
            mestra_alias: 'joao',
            ativo: true
        });

        await novoUsuario.save();

        console.log('\n=================================================');
        console.log('✅ USUÁRIO INICIAL CRIADO COM SUCESSO NO MONGODB!');
        console.log(`📧 E-mail de Login: joao@teste.com`);
        console.log(`🔑 Senha de Login: 123`);
        console.log('=================================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao executar o seed de usuário:', error.message);
        process.exit(1);
    }
};

criarUsuarioInicial();