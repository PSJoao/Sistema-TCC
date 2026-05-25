const express = require('express');
const router = express.Router();
const templateController = require('../controllers/TemplateController');
const { protectRoute, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ==========================================
// Rotas Protegidas (Exigem JWT ativo)
// ==========================================

// GET /dashboard - Exibe o painel principal com os grupos de templates do utilizador logado
router.get('/dashboard', protectRoute, templateController.renderDashboard);

// GET /tutorial - Exibe o manual oficial de uso do sistema
router.get('/tutorial', protectRoute, (req, res) => res.render('tutorial'));

// GET /upload - Exibe a interface de upload para criação de novo template
router.get('/upload', protectRoute, authorizeRoles('mestra', 'admin'), templateController.renderUploadPage);

// POST /templates/upload - Recebe e processa o lote de até 100 ficheiros (.docx ou .txt)
// Utiliza o Multer em memória para capturar o array de ficheiros com o campo "templates"
router.post('/templates/upload', protectRoute, authorizeRoles('mestra', 'admin'), upload.array('templates', 100), templateController.handleUpload);

// GET /templates/editar/:id - Exibe a interface de edição de um grupo de templates
router.get('/templates/editar/:id', protectRoute, templateController.renderEditarTemplate);

// POST /templates/editar/:id - Processa as edições de um grupo de templates
router.post('/templates/editar/:id', protectRoute, templateController.handleEditarTemplate);

// POST /templates/:groupId/adicionar-documento - Adiciona novos documentos a um grupo existente (redirect)
router.post('/templates/:groupId/adicionar-documento', protectRoute, upload.array('templates', 100), templateController.adicionarDocumento);

// POST /templates/:groupId/adicionar-documento-ajax - Adiciona novos documentos via AJAX (retorna JSON)
router.post('/templates/:groupId/adicionar-documento-ajax', protectRoute, upload.array('templates', 100), templateController.adicionarDocumentoAjax);

// POST /templates/:groupId/remover-documento/:docId - Remove um documento individual de um grupo (redirect)
router.post('/templates/:groupId/remover-documento/:docId', protectRoute, templateController.removerDocumento);

// POST /templates/:groupId/remover-documento-ajax/:docId - Remove um documento via AJAX (retorna JSON)
router.post('/templates/:groupId/remover-documento-ajax/:docId', protectRoute, templateController.removerDocumentoAjax);

// POST /templates/:groupId/campos-atualizados - Recalcula campos excluindo docs marcados para remoção (retorna JSON)
router.post('/templates/:groupId/campos-atualizados', protectRoute, templateController.camposAtualizados);

// POST /templates/excluir/:id - Remove um grupo inteiro de templates
router.post('/templates/excluir/:id', protectRoute, authorizeRoles('mestra', 'admin'), templateController.excluirTemplate);

// PUT /templates/:id/permissoes - Atualiza as permissoes de um template (Admin/Mestra)
router.put('/templates/:id/permissoes', protectRoute, authorizeRoles('mestra', 'admin'), templateController.atualizarPermissoes);

module.exports = router;