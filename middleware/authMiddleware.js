const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

/**
 * Middleware para proteger rotas da plataforma.
 * Garante que o utilizador possui um JSON Web Token (JWT) válido e assinado.
 */
async function protectRoute(req, res, next) {
    // Tenta obter o token armazenado nos cookies do navegador
    const token = req.cookies ? req.cookies.auth_token : null;

    // 1. Se não houver token, o acesso é negado.
    if (!token) {
        console.log('[Auth Middleware] Acesso negado. Token não encontrado.');
        return res.redirect('/login');
    }

    try {
        // 2. Verifica a assinatura e a validade do JWT
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Procura o utilizador na Base de Dados para garantir que a conta ainda existe
        const userRecord = await User.findById(decodedPayload.id).select('-senha'); // Exclui a hash da senha por segurança

        if (!userRecord) {
            console.log('[Auth Middleware] Utilizador associado ao token já não existe.');
            res.clearCookie('auth_token');
            return res.redirect('/login');
        }

        // 4. Injeta os dados do utilizador na requisição e nas variáveis locais do Handlebars
        req.user = userRecord;
        res.locals.user = userRecord; // Permite usar {{user.nome}} no main.hbs

        // O utilizador está devidamente autenticado. Permite o avanço para a rota solicitada.
        next();

    } catch (error) {
        // O token é inválido, foi adulterado ou expirou
        console.error('[Auth Middleware] Token JWT inválido ou expirado:', error.message);

        // Limpa o cookie comprometido
        res.clearCookie('auth_token');

        // Redireciona para efetuar um novo login
        return res.redirect('/login');
    }
}

module.exports = {
    protectRoute
};