const express = require('express');
const router = express.Router();
const documentController = require('../controllers/DocumentController');
const { protectRoute } = require('../middleware/authMiddleware');

// ==========================================
// Rotas Protegidas (Exigem JWT ativo nos cookies)
// ==========================================

// GET /documentos/gerar/:id
// Rota acedida a partir do Dashboard para gerar um formulário baseado num único template específico
router.get('/gerar/:id', protectRoute, documentController.renderSingleTemplateForm);

// POST /documentos/gerar
// Processa os dados submetidos pelo super formulário unificado (em lote de até 100 templates),
// executa as lógicas matemáticas e o Proxy case-insensitive, e salva os registos no MongoDB
router.post('/gerar', protectRoute, documentController.handleGerarDocumentos);

module.exports = router;