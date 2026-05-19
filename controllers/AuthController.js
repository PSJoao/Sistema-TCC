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
        const user = await User.findOne({ email });
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
    res.redirect('/login');
};

module.exports = {
    renderLoginPage,
    handleLogin,
    handleLogout
};