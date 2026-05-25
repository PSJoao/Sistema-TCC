// controllers/AuthController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Renderiza a página de login.
 * Se o utilizador já possuir um token ativo nos cookies, redireciona-o para o dashboard.
 */
const renderLoginPage = (req, res) => {
    // Verifica se o cookie 'auth_token' já existe
    if (req.cookies && req.cookies.auth_token) {
        return res.redirect('/dashboard');
    }

    // Renders a página de login utilizando o layout padrão
    res.render('login');
};

/**
 * Renderiza a página de registro de conta Mestra.
 */
const renderRegisterPage = (req, res) => {
    if (req.cookies && req.cookies.auth_token) {
        return res.redirect('/dashboard');
    }
    res.render('register');
};

/**
 * Processa o registro de uma nova conta Mestra.
 */
const handleRegister = async (req, res) => {
    try {
        const { nome, email, password, alias } = req.body;

        if (!nome || !email || !password || !alias) {
            return res.render('register', { error: 'Todos os campos são obrigatórios.', nome, email, alias });
        }

        // Verifica se já existe um usuário com esse email ou alias
        const emailExistente = await User.findOne({ email });
        if (emailExistente) {
            return res.render('register', { error: 'Este e-mail já está em uso.', nome, email, alias });
        }

        const aliasLimpo = alias.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (aliasLimpo.length < 3) {
            return res.render('register', { error: 'O Workspace Alias deve conter pelo menos 3 letras/números.', nome, email, alias });
        }

        const aliasExistente = await User.findOne({ mestra_alias: aliasLimpo });
        if (aliasExistente) {
            return res.render('register', { error: 'Este Workspace Alias já está em uso por outra empresa.', nome, email, alias });
        }

        const novoUsuario = new User({
            nome,
            email,
            senha: password,
            cargo: 'mestra',
            mestra_alias: aliasLimpo,
            ativo: true
        });

        await novoUsuario.save();

        res.render('login', { success: 'Conta criada com sucesso! Faça login abaixo.' });

    } catch (error) {
        console.error('[AuthController.handleRegister] Erro:', error.message);
        res.render('register', {
            error: 'Ocorreu um erro ao criar a conta.',
            nome: req.body.nome,
            email: req.body.email,
            alias: req.body.alias
        });
    }
};

/**
 * Processa a submissão do formulário de login.
 * Valida as credenciais, executa o método da UML e gera o token JWT stateless.
 */
const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validação básica de preenchimento dos campos
        if (!email || !password) {
            return res.render('login', { error: 'E-mail e senha são obrigatórios.' });
        }

        // 1. Procura o utilizador na base de dados pelo e-mail
        const user = await User.findOne({ email, deletado: { $ne: true } });
        if (!user) {
            return res.render('login', { error: 'Credenciais inválidas.', email });
        }

        // 2. Executa o método de instância herdado da nossa modelagem UML: +autenticar()
        const isMatch = await user.autenticar(password);
        if (!isMatch) {
            return res.render('login', { error: 'Credenciais inválidas.', email });
        }

        // 3. Gera o token JSON Web Token (JWT) com os dados essenciais do utilizador
        const token = jwt.sign(
            { id: user._id, nome: user.nome },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // O token expira automaticamente em 24 horas
        );

        // 4. Armazena o JWT gerado num cookie seguro do tipo HttpOnly
        res.cookie('auth_token', token, {
            httpOnly: true, // Impede o acesso ao token via scripts do lado do cliente (proteção XSS)
            secure: process.env.NODE_ENV === 'production', // Força o uso de HTTPS em ambiente de produção
            maxAge: 24 * 60 * 60 * 1000 // Tempo de vida coincidente com o token (1 dia)
        });

        // 5. Redireciona o utilizador autenticado para o ecrã principal
        res.redirect('/dashboard');

    } catch (error) {
        console.error('[AuthController.handleLogin] Erro crítico:', error.message);
        res.render('login', {
            error: 'Ocorreu um erro interno no servidor. Por favor, tente novamente.',
            email: req.body.email
        });
    }
};

/**
 * Processa o encerramento da sessão (Logout).
 */
const handleLogout = (req, res) => {
    // 1. Elimina o cookie que armazena o token JWT do navegador
    res.clearCookie('auth_token');

    // 2. Redireciona imediatamente para a página de login inicial
    res.redirect('/auth/login');
};

module.exports = {
    renderLoginPage,
    handleLogin,
    handleLogout,
    renderRegisterPage,
    handleRegister
};