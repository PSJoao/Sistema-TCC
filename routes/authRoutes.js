const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { protectRoute } = require('../middleware/authMiddleware');

// ==========================================
// Rotas Públicas (Acessíveis sem autenticação)
// ==========================================

// GET /auth/login - Exibe a página de login
// O controlador verifica se o utilizador já está logado para evitar acessos duplicados
router.get('/login', authController.renderLoginPage);

// POST /auth/login - Processa a submissão do formulário de login e gera o JWT
router.post('/login', authController.handleLogin);


// ==========================================
// Rotas Protegidas (Exigem JWT válido nos cookies)
// ==========================================

// GET /auth/logout - Limpa o cookie do token e encerra a sessão do utilizador
router.get('/logout', protectRoute, authController.handleLogout);

module.exports = router;