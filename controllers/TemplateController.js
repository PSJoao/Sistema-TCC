// controllers/TemplateController.js
const Template = require('../models/Template');
const TemplateGroup = require('../models/TemplateGroup');
const templateService = require('../services/TemplateService');
const mammoth = require('mammoth');

/**
 * Renderiza o dashboard com templates agrupados por TemplateGroup.
 */
const renderDashboard = async (req, res) => {
    try {
        // Busca todos os grupos do usuário
        const grupos = await TemplateGroup.find({ id_usuario: req.user._id }).sort({ data_criacao: -1 });

        // Para cada grupo, busca os templates associados
        const gruposFormatados = [];
        for (const grupo of grupos) {
            const templates = await Template.find({ id_grupo: grupo._id }).select('titulo campos data_criacao');
            gruposFormatados.push({
                _id: grupo._id,
                nome: grupo.nome,
                dataCriacao: new Date(grupo.data_criacao).toLocaleDateString('pt-BR'),
                quantidadeDocumentos: templates.length,
                documentos: templates.map(t => ({
                    _id: t._id,
                    titulo: t.titulo
                }))
            });
        }

        res.render('dashboard', { grupos: gruposFormatados });
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
 * Processa o upload de um lote de templates, cria o grupo e redireciona para o formulário editável.
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

        // Criar o grupo
        const novoGrupo = new TemplateGroup({
            nome: nomeGrupo.trim(),
            id_usuario: req.user._id
        });
        await novoGrupo.save();

        // Criar cada template associado ao grupo
        const templatesSalvos = [];
        for (const tData of templatesData) {
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
            templatesSalvos.push(novoTemplate);
        }

        // Montar dados unificados para o formulário com indicadores de pertencimento
        const camposComIndicadores = montarCamposComIndicadores(templatesSalvos);

        res.render('form', {
            fields: camposComIndicadores,
            templatesSelecionados: templatesSalvos.map(t => ({ _id: t._id, titulo: t.titulo })),
            grupoId: novoGrupo._id,
            nomeGrupo: novoGrupo.nome,
            editavel: true // Na criação, o formulário é editável
        });

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
 */
const renderEditarTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        const grupo = await TemplateGroup.findOne({ _id: id, id_usuario: req.user._id });
        if (!grupo) {
            return res.redirect('/dashboard');
        }

        const templates = await Template.find({ id_grupo: grupo._id });

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
            camposComIndicadores: camposComIndicadores
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
        const { nomeGrupo, labels, placeholders } = req.body;

        const grupo = await TemplateGroup.findOne({ _id: id, id_usuario: req.user._id });
        if (!grupo) {
            return res.redirect('/dashboard');
        }

        // Atualizar nome do grupo
        if (nomeGrupo && nomeGrupo.trim()) {
            grupo.nome = nomeGrupo.trim();
            await grupo.save();
        }

        // Atualizar labels e placeholders de cada template
        const templates = await Template.find({ id_grupo: grupo._id });
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
 * Adiciona um novo documento a um grupo existente.
 * POST /templates/:groupId/adicionar-documento
 */
const adicionarDocumento = async (req, res) => {
    try {
        const { groupId } = req.params;

        const grupo = await TemplateGroup.findOne({ _id: groupId, id_usuario: req.user._id });
        if (!grupo) {
            return res.redirect('/dashboard');
        }

        if (!req.files || req.files.length === 0) {
            return res.redirect(`/templates/editar/${groupId}`);
        }

        const { templatesData } = await templateService.processarLoteTemplates(req.files);

        for (const tData of templatesData) {
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
 * Remove um documento individual de um grupo.
 * POST /templates/:groupId/remover-documento/:docId
 */
const removerDocumento = async (req, res) => {
    try {
        const { groupId, docId } = req.params;

        // Verifica que o grupo pertence ao usuário
        const grupo = await TemplateGroup.findOne({ _id: groupId, id_usuario: req.user._id });
        if (!grupo) {
            return res.redirect('/dashboard');
        }

        // Verifica quantos templates restam no grupo
        const totalTemplates = await Template.countDocuments({ id_grupo: groupId });

        if (totalTemplates <= 1) {
            // Se é o último documento, excluir o grupo inteiro
            await Template.deleteOne({ _id: docId, id_grupo: groupId });
            await TemplateGroup.deleteOne({ _id: groupId });
            return res.redirect('/dashboard');
        }

        // Remover apenas o documento
        await Template.deleteOne({ _id: docId, id_grupo: groupId });
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

        // Excluir todos os templates do grupo
        await Template.deleteMany({ id_grupo: id, id_usuario: req.user._id });

        // Excluir o grupo
        await TemplateGroup.deleteOne({ _id: id, id_usuario: req.user._id });

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

module.exports = {
    renderDashboard,
    renderUploadPage,
    handleUpload,
    renderEditarTemplate,
    handleEditarTemplate,
    adicionarDocumento,
    removerDocumento,
    excluirTemplate
};