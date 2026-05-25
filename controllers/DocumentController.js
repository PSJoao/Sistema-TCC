// controllers/DocumentController.js
const Template = require('../models/Template');
const TemplateGroup = require('../models/TemplateGroup');
const documentService = require('../services/DocumentService');
const mammoth = require('mammoth');

/**
 * Renderiza o formulário unificado para um grupo de templates selecionado a partir do Dashboard.
 * O formulário vem em modo NÃO editável (somente preenchimento).
 * GET /documentos/gerar/:id
 */
const renderSingleTemplateForm = async (req, res) => {
    try {
        const { id } = req.params;

        const workspaceId = req.user.cargo === 'mestra' ? req.user._id : req.user.id_mestra;

        // Procura o grupo na base de dados e garante que pertence ao workspace
        let query = { _id: id, id_mestra: workspaceId, deletado: { $ne: true } };
        
        // Se for funcionário, deve ter acesso explícito
        if (req.user.cargo === 'funcionario') {
            query['permissoes.id_usuario'] = req.user._id;
        }

        const grupo = await TemplateGroup.findOne(query);

        if (!grupo) {
            return res.redirect('/dashboard');
        }

        // Busca todos os templates do grupo
        const templates = await Template.find({ id_grupo: grupo._id, deletado: { $ne: true } });

        if (!templates || templates.length === 0) {
            return res.redirect('/dashboard');
        }

        // Montar campos com indicadores de pertencimento
        const camposComIndicadores = montarCamposComIndicadores(templates);

        // Renderiza a view 'form.hbs', passando todos os templates do grupo
        res.render('form', {
            fields: camposComIndicadores,
            templatesSelecionados: templates.map(t => ({ _id: t._id, titulo: t.titulo })),
            grupoId: grupo._id,
            nomeGrupo: grupo.nome
        });

    } catch (error) {
        console.error('[DocumentController.renderSingleTemplateForm] Erro:', error.message);
        res.redirect('/dashboard');
    }
};

/**
 * Processa a submissão do formulário preenchido e gera os documentos finais em Word (.docx).
 * POST /documentos/gerar
 */
const handleGerarDocumentos = async (req, res) => {
    try {
        const { templateIds, valores, grupoId } = req.body;

        if (!templateIds || templateIds.length === 0) {
            return res.render('form', {
                error: 'Nenhum template válido foi fornecido para a geração.',
                fields: [],
                templatesSelecionados: []
            });
        }

        const dadosFormulario = valores || {};

        // Validar se o usuário tem permissão para este grupoId
        const workspaceId = req.user.cargo === 'mestra' ? req.user._id : req.user.id_mestra;
        let query = { _id: grupoId, id_mestra: workspaceId, deletado: { $ne: true } };
        if (req.user.cargo === 'funcionario') {
            query['permissoes.id_usuario'] = req.user._id;
        }

        const grupo = await TemplateGroup.findOne(query);
        if (!grupo) {
             return res.render('form', {
                error: 'Acesso negado ou template inexistente.',
                fields: [],
                templatesSelecionados: []
            });
        }

        // Aciona o DocumentService para compilar os documentos Word e guardar no disco
        const resultadoGeral = await documentService.gerarDocumentosEmMassa(templateIds, dadosFormulario, req.user);

        // Encaminha o pacote gerado (.zip) para a página de download bem-sucedido
        res.render('resultado', {
            documentos: resultadoGeral.documentos,
            zipUrl: resultadoGeral.zipUrl
        });

    } catch (error) {
        console.error('[DocumentController.handleGerarDocumentos] Erro crítico:', error.message);
        res.render('form', {
            error: 'Ocorreu um erro crítico ao compilar os seus documentos: ' + error.message,
            fields: [],
            templatesSelecionados: []
        });
    }
};

/**
 * Função auxiliar: Monta a lista de campos unificados com indicadores de pertencimento.
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
    renderSingleTemplateForm,
    handleGerarDocumentos
};