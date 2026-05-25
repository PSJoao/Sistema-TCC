// controllers/TemplateController.js
const Template = require('../models/Template');
const TemplateGroup = require('../models/TemplateGroup');
const User = require('../models/User');
const templateService = require('../services/TemplateService');
const mammoth = require('mammoth');

/**
 * Renderiza o dashboard com templates agrupados por TemplateGroup.
 */
const renderDashboard = async (req, res) => {
    try {
        const workspaceId = req.user.cargo === 'mestra' ? req.user._id : req.user.id_mestra;

        // Limpar rascunhos abandonados do próprio usuário
        const limiteRascunho = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const rascunhosAntigos = await TemplateGroup.find({
            id_usuario: req.user._id,
            rascunho: true,
            data_criacao: { $lt: limiteRascunho }
        });
        for (const rascunho of rascunhosAntigos) {
            await Template.deleteMany({ id_grupo: rascunho._id });
            await TemplateGroup.deleteOne({ _id: rascunho._id });
        }

        // Busca de grupos
        let query = { id_mestra: workspaceId, rascunho: { $ne: true }, deletado: { $ne: true } };
        
        // Se for funcionário, restringe apenas aos templates que ele tem permissão
        if (req.user.cargo === 'funcionario') {
            query['permissoes.id_usuario'] = req.user._id;
        }

        const grupos = await TemplateGroup.find(query).sort({ data_criacao: -1 });

        // Para cada grupo, busca os templates associados
        const gruposFormatados = [];
        for (const grupo of grupos) {
            const templates = await Template.find({ id_grupo: grupo._id, deletado: { $ne: true } }).select('titulo campos data_criacao');
            
            let podeEditar = true;
            if (req.user.cargo === 'funcionario') {
                const perm = grupo.permissoes.find(p => p.id_usuario.toString() === req.user._id.toString());
                podeEditar = perm ? perm.pode_editar : false;
            }

            gruposFormatados.push({
                _id: grupo._id,
                nome: grupo.nome,
                dataCriacao: new Date(grupo.data_criacao).toLocaleDateString('pt-BR'),
                quantidadeDocumentos: templates.length,
                podeEditar: podeEditar,
                permissoes: grupo.permissoes, // Repassa as permissões atuais
                documentos: templates.map(t => ({
                    _id: t._id,
                    titulo: t.titulo
                }))
            });
        }

        // Buscar lista de funcionários do workspace (apenas para Admin/Mestra poder gerenciar permissões)
        let funcionarios = [];
        if (req.user.cargo !== 'funcionario') {
            funcionarios = await User.find({ id_mestra: workspaceId, cargo: 'funcionario', deletado: { $ne: true } }).select('_id nome email');
        }

        res.render('dashboard', { 
            grupos: gruposFormatados, 
            funcionarios: funcionarios.map(f => f.toObject()) 
        });
    } catch (error) {
        console.error('[TemplateController.renderDashboard] Erro:', error.message);
        res.render('dashboard', {
            error: 'Ocorreu um erro ao carregar os seus templates. Por favor, tente novamente.',
            grupos: []
        });
    }
};

/**
 * Renderiza a página de upload de templates em lote.
 */
const renderUploadPage = (req, res) => {
    res.render('upload');
};

/**
 * Processa o upload de um lote de templates, cria o grupo e redireciona para a tela de edição.
 */
const handleUpload = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.render('upload', { error: 'Por favor, selecione pelo menos um ficheiro para processar o lote.' });
        }

        const nomeGrupo = req.body.nomeGrupo;
        if (!nomeGrupo || !nomeGrupo.trim()) {
            return res.render('upload', { error: 'Por favor, forneça um nome para o template.' });
        }

        // Processar os arquivos e extrair campos por documento
        const { fields, templatesData } = await templateService.processarLoteTemplates(req.files);

        const workspaceId = req.user.cargo === 'mestra' ? req.user._id : req.user.id_mestra;

        // Criar o grupo como RASCUNHO (não aparece no dashboard até clicar Finalizar)
        const novoGrupo = new TemplateGroup({
            nome: nomeGrupo.trim(),
            id_usuario: req.user._id,
            id_mestra: workspaceId,
            rascunho: true
        });
        await novoGrupo.save();

        // Criar cada template associado ao grupo (com deduplicação por título no mesmo lote)
        const titulosAdicionados = new Set();
        for (const tData of templatesData) {
            // Validação anti-duplicata: pular se já adicionamos um doc com o mesmo título neste lote
            if (titulosAdicionados.has(tData.titulo)) {
                continue;
            }
            titulosAdicionados.add(tData.titulo);

            // Gerar labels e placeholders padrão
            const labelsDefault = {};
            const placeholdersDefault = {};
            for (const campo of tData.campos) {
                labelsDefault[campo] = campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                placeholdersDefault[campo] = `Introduza o valor para ${labelsDefault[campo]}`;
            }

            const novoTemplate = new Template({
                titulo: tData.titulo,
                arquivo_original: tData.arquivo_original,
                id_usuario: req.user._id,
                id_grupo: novoGrupo._id,
                campos: tData.campos,
                labels: labelsDefault,
                placeholders: placeholdersDefault
            });

            await novoTemplate.save();
        }

        // Redirecionar para a tela de edição com flag de novo template
        res.redirect(`/templates/editar/${novoGrupo._id}?novo=1`);

    } catch (error) {
        console.error('[TemplateController.handleUpload] Erro crítico:', error.message);
        res.render('upload', {
            error: error.message || 'Ocorreu um erro inesperado ao processar o lote de templates.'
        });
    }
};

/**
 * Renderiza a tela de edição de um grupo de templates.
 * GET /templates/editar/:id
 * Query param ?novo=1 indica que é uma criação recém-feita
 */
const renderEditarTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const novoCriado = req.query.novo === '1';

        const grupo = await getGrupoAutorizado(req, id, true); // true = requer permissao de edicao
        if (!grupo) {
            return res.redirect('/dashboard');
        }

        const templates = await Template.find({ id_grupo: grupo._id, deletado: { $ne: true } });

        // Montar campos com indicadores
        const camposComIndicadores = montarCamposComIndicadores(templates);

        res.render('editar', {
            grupo: {
                _id: grupo._id,
                nome: grupo.nome
            },
            templates: templates.map(t => ({
                _id: t._id,
                titulo: t.titulo,
                campos: t.campos
            })),
            camposComIndicadores: camposComIndicadores,
            novoCriado: novoCriado
        });

    } catch (error) {
        console.error('[TemplateController.renderEditarTemplate] Erro:', error.message);
        res.redirect('/dashboard');
    }
};

/**
 * Processa as edições de um grupo de templates.
 * POST /templates/editar/:id
 */
const handleEditarTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomeGrupo, labels, placeholders, docsParaRemover } = req.body;

        const grupo = await getGrupoAutorizado(req, id, true);
        if (!grupo) {
            return res.redirect('/dashboard');
        }

        // Processar remoções de documentos pendentes
        if (docsParaRemover) {
            const idsParaRemover = Array.isArray(docsParaRemover) ? docsParaRemover : [docsParaRemover];
            for (const docId of idsParaRemover) {
                await Template.updateOne({ _id: docId, id_grupo: id }, { deletado: true });
            }

            // Verificar se restou algum template no grupo
            const restantes = await Template.countDocuments({ id_grupo: id, deletado: { $ne: true } });
            if (restantes === 0) {
                // Se não sobrou nenhum documento, excluir o grupo inteiro
                await TemplateGroup.updateOne({ _id: id }, { deletado: true });
                return res.redirect('/dashboard');
            }
        }

        // Atualizar nome do grupo
        if (nomeGrupo && nomeGrupo.trim()) {
            grupo.nome = nomeGrupo.trim();
        }

        // Marcar como finalizado (não é mais rascunho)
        grupo.rascunho = false;
        await grupo.save();

        // Atualizar labels e placeholders de cada template
        const templates = await Template.find({ id_grupo: grupo._id, deletado: { $ne: true } });
        for (const template of templates) {
            let atualizado = false;

            if (labels) {
                const novosLabels = { ...template.labels };
                for (const campo of template.campos) {
                    if (labels[campo] !== undefined && labels[campo].trim()) {
                        novosLabels[campo] = labels[campo].trim();
                    }
                }
                template.labels = novosLabels;
                atualizado = true;
            }

            if (placeholders) {
                const novosPlaceholders = { ...template.placeholders };
                for (const campo of template.campos) {
                    if (placeholders[campo] !== undefined) {
                        novosPlaceholders[campo] = placeholders[campo].trim();
                    }
                }
                template.placeholders = novosPlaceholders;
                atualizado = true;
            }

            if (atualizado) {
                template.markModified('labels');
                template.markModified('placeholders');
                await template.save();
            }
        }

        res.redirect('/dashboard');

    } catch (error) {
        console.error('[TemplateController.handleEditarTemplate] Erro:', error.message);
        res.redirect('/dashboard');
    }
};

/**
 * Adiciona um novo documento a um grupo existente (redirecionamento tradicional).
 * POST /templates/:groupId/adicionar-documento
 */
const adicionarDocumento = async (req, res) => {
    try {
        const { groupId } = req.params;

        const grupo = await getGrupoAutorizado(req, groupId, true);
        if (!grupo) {
            return res.redirect('/dashboard');
        }

        if (!req.files || req.files.length === 0) {
            return res.redirect(`/templates/editar/${groupId}`);
        }

        const { templatesData } = await templateService.processarLoteTemplates(req.files);

        // Buscar títulos existentes no grupo para evitar duplicatas
        const titulosExistentes = await Template.find({ id_grupo: grupo._id, deletado: { $ne: true } }).select('titulo');
        const setTitulos = new Set(titulosExistentes.map(t => t.titulo));

        for (const tData of templatesData) {
            // Validação anti-duplicata: pular se já existe um doc com o mesmo título no grupo
            if (setTitulos.has(tData.titulo)) {
                continue;
            }
            setTitulos.add(tData.titulo);

            const labelsDefault = {};
            const placeholdersDefault = {};
            for (const campo of tData.campos) {
                labelsDefault[campo] = campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                placeholdersDefault[campo] = `Introduza o valor para ${labelsDefault[campo]}`;
            }

            const novoTemplate = new Template({
                titulo: tData.titulo,
                arquivo_original: tData.arquivo_original,
                id_usuario: req.user._id,
                id_grupo: grupo._id,
                campos: tData.campos,
                labels: labelsDefault,
                placeholders: placeholdersDefault
            });

            await novoTemplate.save();
        }

        res.redirect(`/templates/editar/${groupId}`);

    } catch (error) {
        console.error('[TemplateController.adicionarDocumento] Erro:', error.message);
        res.redirect('/dashboard');
    }
};

/**
 * Adiciona documentos via AJAX e retorna JSON com os novos documentos e campos atualizados.
 * POST /templates/:groupId/adicionar-documento-ajax
 */
const adicionarDocumentoAjax = async (req, res) => {
    try {
        const { groupId } = req.params;

        const grupo = await getGrupoAutorizado(req, groupId, true);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo não encontrado ou sem permissão.' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
        }

        const { templatesData } = await templateService.processarLoteTemplates(req.files);
        const novosTemplates = [];
        const duplicadosPulados = [];

        // Buscar títulos existentes no grupo para evitar duplicatas
        const titulosExistentes = await Template.find({ id_grupo: grupo._id, deletado: { $ne: true } }).select('titulo');
        const setTitulos = new Set(titulosExistentes.map(t => t.titulo));

        for (const tData of templatesData) {
            // Validação anti-duplicata: se já existe um doc com o mesmo título, pular
            if (setTitulos.has(tData.titulo)) {
                duplicadosPulados.push(tData.titulo);
                continue;
            }
            setTitulos.add(tData.titulo);

            const labelsDefault = {};
            const placeholdersDefault = {};
            for (const campo of tData.campos) {
                labelsDefault[campo] = campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                placeholdersDefault[campo] = `Introduza o valor para ${labelsDefault[campo]}`;
            }

            const novoTemplate = new Template({
                titulo: tData.titulo,
                arquivo_original: tData.arquivo_original,
                id_usuario: req.user._id,
                id_grupo: grupo._id,
                campos: tData.campos,
                labels: labelsDefault,
                placeholders: placeholdersDefault
            });

            await novoTemplate.save();
            novosTemplates.push({
                _id: novoTemplate._id,
                titulo: novoTemplate.titulo,
                campos: novoTemplate.campos
            });
        }

        // Recalcular todos os campos com indicadores
        const todosTemplates = await Template.find({ id_grupo: grupo._id, deletado: { $ne: true } });
        const camposComIndicadores = montarCamposComIndicadores(todosTemplates);

        res.json({
            success: true,
            novosTemplates: novosTemplates,
            duplicadosPulados: duplicadosPulados,
            todosTemplates: todosTemplates.map(t => ({
                _id: t._id,
                titulo: t.titulo,
                campos: t.campos
            })),
            camposComIndicadores: camposComIndicadores
        });

    } catch (error) {
        console.error('[TemplateController.adicionarDocumentoAjax] Erro:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao processar o documento.' });
    }
};

/**
 * Remove um documento via AJAX e retorna JSON com os campos atualizados.
 * POST /templates/:groupId/remover-documento-ajax/:docId
 */
const removerDocumentoAjax = async (req, res) => {
    try {
        const { groupId, docId } = req.params;

        const grupo = await getGrupoAutorizado(req, groupId, true);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo não encontrado ou sem permissão.' });
        }

        // Verificar quantos templates restam
        const totalTemplates = await Template.countDocuments({ id_grupo: groupId, deletado: { $ne: true } });

        if (totalTemplates <= 1) {
            // Se é o último, excluir grupo inteiro
            await Template.updateOne({ _id: docId, id_grupo: groupId }, { deletado: true });
            await TemplateGroup.updateOne({ _id: groupId }, { deletado: true });
            return res.json({ success: true, grupoExcluido: true });
        }

        // Remover apenas o documento
        await Template.updateOne({ _id: docId, id_grupo: groupId }, { deletado: true });

        // Recalcular campos
        const todosTemplates = await Template.find({ id_grupo: groupId, deletado: { $ne: true } });
        const camposComIndicadores = montarCamposComIndicadores(todosTemplates);

        res.json({
            success: true,
            grupoExcluido: false,
            todosTemplates: todosTemplates.map(t => ({
                _id: t._id,
                titulo: t.titulo,
                campos: t.campos
            })),
            camposComIndicadores: camposComIndicadores
        });

    } catch (error) {
        console.error('[TemplateController.removerDocumentoAjax] Erro:', error.message);
        res.status(500).json({ error: 'Erro ao remover o documento.' });
    }
};

/**
 * Remove um documento individual de um grupo (rota tradicional com redirect).
 * POST /templates/:groupId/remover-documento/:docId
 */
const removerDocumento = async (req, res) => {
    try {
        const { groupId, docId } = req.params;

        // Verifica permissao de edicao
        const grupo = await getGrupoAutorizado(req, groupId, true);
        if (!grupo) {
            return res.redirect('/dashboard');
        }

        // Verifica quantos templates restam no grupo
        const totalTemplates = await Template.countDocuments({ id_grupo: groupId, deletado: { $ne: true } });

        if (totalTemplates <= 1) {
            // Se é o último documento, excluir o grupo inteiro
            await Template.updateOne({ _id: docId, id_grupo: groupId }, { deletado: true });
            await TemplateGroup.updateOne({ _id: groupId }, { deletado: true });
            return res.redirect('/dashboard');
        }

        // Remover apenas o documento
        await Template.updateOne({ _id: docId, id_grupo: groupId }, { deletado: true });
        res.redirect(`/templates/editar/${groupId}`);

    } catch (error) {
        console.error('[TemplateController.removerDocumento] Erro:', error.message);
        res.redirect('/dashboard');
    }
};

/**
 * Exclui um grupo inteiro de templates e todos os documentos associados.
 * POST /templates/excluir/:id
 */
const excluirTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        // Excluir requer nivel admin/mestra
        if (req.user.cargo === 'funcionario') {
            return res.redirect('/dashboard');
        }

        const workspaceId = req.user.cargo === 'mestra' ? req.user._id : req.user.id_mestra;

        // Verifica se o grupo pertence a este workspace
        const grupo = await TemplateGroup.findOne({ _id: id, id_mestra: workspaceId, deletado: { $ne: true } });
        if (!grupo) return res.redirect('/dashboard');

        // Excluir todos os templates do grupo
        await Template.updateMany({ id_grupo: id }, { deletado: true });

        // Excluir o grupo
        await TemplateGroup.updateOne({ _id: id }, { deletado: true });

        res.redirect('/dashboard');
    } catch (error) {
        console.error('[TemplateController.excluirTemplate] Erro:', error.message);
        res.redirect('/dashboard');
    }
};

/**
 * Função auxiliar: Monta a lista de campos unificados com indicadores de pertencimento.
 * Retorna array de objetos { campo, label, placeholder, documentos: [nomes] }
 */
function montarCamposComIndicadores(templates) {
    const mapaGlobal = {};

    for (const template of templates) {
        for (const campo of template.campos) {
            if (!mapaGlobal[campo]) {
                mapaGlobal[campo] = {
                    campo: campo,
                    label: (template.labels && template.labels[campo]) || campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    placeholder: (template.placeholders && template.placeholders[campo]) || `Introduza o valor para ${campo}`,
                    documentos: []
                };
            }
            mapaGlobal[campo].documentos.push(template.titulo);
        }
    }

    return Object.values(mapaGlobal);
}

/**
 * Recalcula os campos com indicadores, excluindo documentos marcados para remoção no client-side.
 * POST /templates/:groupId/campos-atualizados
 * Body: { docsRemovidos: [docId1, docId2, ...] }
 */
const camposAtualizados = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { docsRemovidos } = req.body;

        const grupo = await getGrupoAutorizado(req, groupId, true);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo não encontrado ou sem permissão.' });
        }

        // Buscar todos os templates, excluindo os marcados para remoção
        let filtro = { id_grupo: groupId, deletado: { $ne: true } };
        if (docsRemovidos && docsRemovidos.length > 0) {
            filtro._id = { $nin: docsRemovidos };
        }

        const templates = await Template.find(filtro);
        const camposComIndicadores = montarCamposComIndicadores(templates);

        res.json({
            success: true,
            camposComIndicadores: camposComIndicadores
        });

    } catch (error) {
        console.error('[TemplateController.camposAtualizados] Erro:', error.message);
        res.status(500).json({ error: 'Erro ao recalcular campos.' });
    }
};

/**
 * Helper para buscar o grupo garantindo que o usuário tem permissão para acessá-lo.
 * @param {Object} req - Objeto de requisição express
 * requireEdicao = true -> O usuário deve poder editar.
 */
async function getGrupoAutorizado(req, id, requireEdicao = false) {
    const workspaceId = req.user.cargo === 'mestra' ? req.user._id : req.user.id_mestra;
    
    let query = { _id: id, id_mestra: workspaceId, deletado: { $ne: true } };
    
    // Se for admin ou mestra, eles tem acesso irrestrito dentro do workspace, não precisa filtrar permissão individual
    if (req.user.cargo === 'funcionario') {
        if (requireEdicao) {
            query['permissoes'] = { $elemMatch: { id_usuario: req.user._id, pode_editar: true } };
        } else {
            query['permissoes.id_usuario'] = req.user._id;
        }
    }
    
    return await TemplateGroup.findOne(query);
}

/**
 * Atualiza as permissões de um template específico para funcionários.
 * Apenas acessível por Admins/Mestra.
 */
const atualizarPermissoes = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissoes } = req.body; // array de { id_usuario, pode_editar }

        if (req.user.cargo === 'funcionario') {
            return res.status(403).json({ error: 'Acesso negado.' });
        }

        const workspaceId = req.user.cargo === 'mestra' ? req.user._id : req.user.id_mestra;

        const grupo = await TemplateGroup.findOne({ _id: id, id_mestra: workspaceId });
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo não encontrado.' });
        }

        grupo.permissoes = permissoes || [];
        await grupo.save();

        res.json({ success: true });
    } catch (error) {
        console.error('[TemplateController.atualizarPermissoes] Erro:', error.message);
        res.status(500).json({ error: 'Erro ao salvar permissões.' });
    }
};

module.exports = {
    renderDashboard,
    renderUploadPage,
    handleUpload,
    renderEditarTemplate,
    handleEditarTemplate,
    adicionarDocumento,
    adicionarDocumentoAjax,
    removerDocumento,
    removerDocumentoAjax,
    camposAtualizados,
    excluirTemplate,
    atualizarPermissoes
};