const express = require('express');
const router = express.Router();
const templateController = require('../controllers/TemplateController');
const { protectRoute } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ==========================================
// Rotas Protegidas (Exigem JWT ativo)
// ==========================================

// GET /dashboard - Exibe o painel principal com os grupos de templates do utilizador logado
router.get('/dashboard', protectRoute, templateController.renderDashboard);

// GET /upload - Exibe a interface de upload em lote (Drag and Drop)
router.get('/upload', protectRoute, templateController.renderUploadPage);

// POST /templates/upload - Recebe e processa o lote de até 100 ficheiros (.docx ou .txt)
// Utiliza o Multer em memória para capturar o array de ficheiros com o campo "templates"
router.post('/templates/upload', protectRoute, upload.array('templates', 100), templateController.handleUpload);

// GET /templates/editar/:id - Exibe a interface de edição de um grupo de templates
router.get('/templates/editar/:id', protectRoute, templateController.renderEditarTemplate);

// POST /templates/editar/:id - Processa as edições de um grupo de templates
router.post('/templates/editar/:id', protectRoute, templateController.handleEditarTemplate);

// POST /templates/:groupId/adicionar-documento - Adiciona novos documentos a um grupo existente
router.post('/templates/:groupId/adicionar-documento', protectRoute, upload.array('templates', 100), templateController.adicionarDocumento);

// POST /templates/:groupId/remover-documento/:docId - Remove um documento individual de um grupo
router.post('/templates/:groupId/remover-documento/:docId', protectRoute, templateController.removerDocumento);

// POST /templates/excluir/:id - Remove um grupo inteiro de templates
router.post('/templates/excluir/:id', protectRoute, templateController.excluirTemplate);

module.exports = router;