const express = require('express');
const router = express.Router();
const templateController = require('../controllers/TemplateController');
const { protectRoute } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ==========================================
// Rotas Protegidas (Exigem JWT ativo)
// ==========================================

// GET /dashboard - Exibe o painel principal com os templates do utilizador logado
router.get('/dashboard', protectRoute, templateController.renderDashboard);

// GET /upload - Exibe a interface de upload em lote (Drag and Drop)
router.get('/upload', protectRoute, templateController.renderUploadPage);

// POST /templates/upload - Recebe e processa o lote de até 100 ficheiros (.docx ou .txt)
// Utiliza o Multer em memória para capturar o array de ficheiros com o campo "templates"
router.post('/templates/upload', protectRoute, upload.array('templates', 100), templateController.handleUpload);

// POST /templates/excluir/:id - Remove um template específico da base de dados MongoDB
router.post('/templates/excluir/:id', protectRoute, templateController.excluirTemplate);

module.exports = router;