const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { protectRoute } = require('../middleware/authMiddleware');

// ==========================================
// Rotas Públicas (Acessíveis sem autenticação)
// ==========================================

// GET /auth/login - Exibe o formulário de login
router.get('/login', authController.renderLoginPage);

// POST /auth/login - Recebe as credenciais, valida e gera o token JWT
router.post('/login', authController.handleLogin);

// GET /auth/register - Exibe o formulário de registro de conta Mestra
router.get('/register', authController.renderRegisterPage);

// POST /auth/register - Recebe os dados de registro
router.post('/register', authController.handleRegister);


// ==========================================
// Rotas Protegidas (Exigem JWT válido nos cookies)
// ==========================================

// GET /auth/logout - Limpa o cookie do token e encerra a sessão do utilizador
router.get('/logout', protectRoute, authController.handleLogout);

module.exports = router;