// controllers/TemplateController.js
const Template = require('../models/Template');
const templateService = require('../services/TemplateService');

const renderDashboard = async (req, res) => {
    try {
        const templates = await Template.find({ id_usuario: req.user._id }).sort({ data_criacao: -1 });

        const templatesFormatados = templates.map(t => ({
            _id: t._id,
            titulo: t.titulo,
            dataCriacao: new Date(t.data_criacao).toLocaleDateString('pt-BR')
        }));

        res.render('dashboard', { templates: templatesFormatados });
    } catch (error) {
        console.error('[TemplateController.renderDashboard] Erro:', error.message);
        res.render('dashboard', {
            error: 'Ocorreu um erro ao carregar os seus templates. Por favor, tente novamente.',
            templates: []
        });
    }
};

const renderUploadPage = (req, res) => {
    res.render('upload');
};

const handleUpload = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.render('upload', { error: 'Por favor, selecione pelo menos um ficheiro para processar o lote.' });
        }

        const { fields, templatesData } = await templateService.processarLoteTemplates(req.files);

        const templatesSalvos = [];
        for (const tData of templatesData) {
            const novoTemplate = new Template({
                titulo: tData.titulo,
                // CORREÇÃO: Agora enviamos o buffer binário do Word em vez do HTML antigo
                arquivo_original: tData.arquivo_original,
                id_usuario: req.user._id
            });

            await novoTemplate.save();
            templatesSalvos.push(novoTemplate);
        }

        res.render('form', {
            fields: fields,
            templatesSelecionados: templatesSalvos.map(t => ({ _id: t._id, titulo: t.titulo }))
        });

    } catch (error) {
        console.error('[TemplateController.handleUpload] Erro crítico:', error.message);
        res.render('upload', {
            error: error.message || 'Ocorreu um erro inesperado ao processar o lote de templates.'
        });
    }
};

const excluirTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await Template.deleteOne({ _id: id, id_usuario: req.user._id });
        res.redirect('/dashboard');
    } catch (error) {
        console.error('[TemplateController.excluirTemplate] Erro:', error.message);
        res.redirect('/dashboard');
    }
};

module.exports = {
    renderDashboard,
    renderUploadPage,
    handleUpload,
    excluirTemplate
};