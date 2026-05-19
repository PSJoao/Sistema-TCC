// controllers/DocumentController.js
const Template = require('../models/Template');
const documentService = require('../services/DocumentService');
const mammoth = require('mammoth');

/**
 * Renderiza o formulário unificado para um único template selecionado a partir do Dashboard.
 * GET /documentos/gerar/:id
 */
const renderSingleTemplateForm = async (req, res) => {
    try {
        const { id } = req.params;

        // Procura o template na base de dados e garante que pertence ao utilizador logado
        const template = await Template.findOne({ _id: id, id_usuario: req.user._id });

        if (!template) {
            return res.redirect('/dashboard');
        }

        // Extração de variáveis do arquivo binário do Word (.docx) armazenado no MongoDB
        const resultadoTexto = await mammoth.extractRawText({ buffer: template.arquivo_original });
        const textoBruto = resultadoTexto.value;

        const campos = new Set();
        const regexChaves = /\{\{\s*([\s\S]+?)\s*\}\}/g;
        let match;

        while ((match = regexChaves.exec(textoBruto)) !== null) {
            const expressaoInterna = match[1].trim();
            const regexPalavras = /[a-zA-Z_][a-zA-Z0-9_]*/g;
            let palavraMatch;

            while ((palavraMatch = regexPalavras.exec(expressaoInterna)) !== null) {
                const palavra = palavraMatch[0];
                // Ignora a palavra reservada do nosso helper de cálculo
                if (palavra !== 'calc') {
                    campos.add(palavra.toLowerCase());
                }
            }
        }

        // Renderiza a view 'form.hbs', passando apenas este template no lote
        res.render('form', {
            fields: Array.from(campos),
            templatesSelecionados: [{ _id: template._id, titulo: template.titulo }]
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
        const { templateIds, valores } = req.body;

        if (!templateIds || templateIds.length === 0) {
            return res.render('form', {
                error: 'Nenhum template válido foi fornecido para a geração.',
                fields: [],
                templatesSelecionados: []
            });
        }

        const dadosFormulario = valores || {};

        // Aciona o DocumentService para compilar os documentos Word e guardar no disco
        const documentosGerados = await documentService.gerarDocumentosEmMassa(templateIds, dadosFormulario, req.user._id);

        // Encaminha o array de documentos gerados (.docx) para a página de download bem-sucedido
        res.render('resultado', {
            documentos: documentosGerados
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

module.exports = {
    renderSingleTemplateForm,
    handleGerarDocumentos
};