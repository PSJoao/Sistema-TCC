const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { protectRoute, authorizeRoles } = require('../middleware/authMiddleware');

// Todas as rotas de usuário exigem que o solicitante esteja autenticado E seja uma 'mestra'
router.use(protectRoute);
router.use(authorizeRoles('mestra'));

// GET /usuarios - Abre a tela de gestão
router.get('/', userController.listarUsuarios);

// POST /usuarios/criar - Cria um novo usuário subordinado
router.post('/criar', userController.criarUsuario);

// PUT /usuarios/:id/status - Ativa/inativa um usuário
router.put('/:id/status', userController.alternarStatus);

// PUT /usuarios/:id/cargo - Altera o cargo de um usuário
router.put('/:id/cargo', userController.alterarCargo);

// DELETE /usuarios/:id - Remove um usuário
router.delete('/:id', userController.excluirUsuario);

module.exports = router;
