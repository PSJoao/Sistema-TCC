const User = require('../models/User');

/**
 * Lista todos os usuários criados pela Mestra atual.
 */
const listarUsuarios = async (req, res) => {
    try {
        // Apenas busca usuários cujo id_mestra seja o ID da mestra atual e não estejam deletados
        const usuarios = await User.find({ id_mestra: req.user._id, deletado: { $ne: true } }).sort({ data_criacao: -1 });
        
        res.render('gestao-usuarios', {
            usuarios: usuarios.map(u => u.toObject())
        });
    } catch (error) {
        console.error('[UserController.listarUsuarios]', error);
        res.status(500).send('Erro ao carregar usuários.');
    }
};

/**
 * Cria uma nova subconta (Admin ou Funcionário).
 */
const criarUsuario = async (req, res) => {
    try {
        const { nome, username, password, cargo } = req.body;
        
        if (!nome || !username || !password || !cargo) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        // Validação de cargo
        if (cargo !== 'admin' && cargo !== 'funcionario') {
            return res.status(400).json({ error: 'Cargo inválido.' });
        }

        // Limpa o username
        const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        
        // Concatena com o alias da Mestra
        const emailFinal = `${cleanUsername}@${req.user.mestra_alias}`;

        const existente = await User.findOne({ email: emailFinal });
        if (existente) {
            return res.status(400).json({ error: 'Este nome de usuário já está em uso na sua empresa.' });
        }

        const novoUser = new User({
            nome,
            email: emailFinal,
            senha: password,
            cargo,
            id_mestra: req.user._id,
            ativo: true
        });

        await novoUser.save();
        res.json({ success: true });
    } catch (error) {
        console.error('[UserController.criarUsuario]', error);
        res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
};

/**
 * Alterna o status ativo/inativo de um usuário.
 */
const alternarStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const usuario = await User.findOne({ _id: userId, id_mestra: req.user._id, deletado: { $ne: true } });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        usuario.ativo = !usuario.ativo;
        await usuario.save();

        res.json({ success: true, ativo: usuario.ativo });
    } catch (error) {
        console.error('[UserController.alternarStatus]', error);
        res.status(500).json({ error: 'Erro ao alterar status.' });
    }
};

/**
 * Exclui permanentemente um usuário.
 */
const excluirUsuario = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await User.updateOne({ _id: userId, id_mestra: req.user._id }, { deletado: true });

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[UserController.excluirUsuario]', error);
        res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
};

/**
 * Altera o cargo de um usuário subordinado.
 */
const alterarCargo = async (req, res) => {
    try {
        const userId = req.params.id;
        const { cargo } = req.body;

        if (cargo !== 'admin' && cargo !== 'funcionario') {
            return res.status(400).json({ error: 'Cargo inválido.' });
        }

        const usuario = await User.findOne({ _id: userId, id_mestra: req.user._id, deletado: { $ne: true } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        usuario.cargo = cargo;
        await usuario.save();

        res.json({ success: true });
    } catch (error) {
        console.error('[UserController.alterarCargo]', error);
        res.status(500).json({ error: 'Erro ao alterar cargo.' });
    }
};

module.exports = {
    listarUsuarios,
    criarUsuario,
    alternarStatus,
    excluirUsuario,
    alterarCargo
};
