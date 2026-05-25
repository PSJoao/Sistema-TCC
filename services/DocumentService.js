// services/DocumentService.js
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const Template = require('../models/Template');
const TemplateGroup = require('../models/TemplateGroup');
const DocumentoGerado = require('../models/DocumentoGerado');

/**
 * Serviço responsável pela manipulação binária de ficheiros Word (.docx),
 * injeção de dados nativa e resolução de cálculos em documentos físicos.
 */
class DocumentService {
    /**
     * Processa o lote de templates em formato Word, injeta os dados preservando o estilo
     * original, executa fórmulas matemáticas e gera os ficheiros .docx finais.
     * @param {Array<string>} templateIds - IDs do lote de templates selecionados
     * @param {Object} valoresFormulario - JSON com as variáveis vindas do formulário
     * @param {Object} user - O utilizador autenticado completo
     * @returns {Promise<Array>} - Lista com os metadados dos documentos gerados
     */
    async gerarDocumentosEmMassa(templateIds, valoresFormulario, user) {
        const documentosCompilados = [];

        // 1. Proxy de Engenharia Avançada para o Docxtemplater
        // Intercepta todas as tags que o motor tentar ler de dentro do ficheiro do Word
        const contextoInteligente = new Proxy(valoresFormulario, {
            get: (target, prop) => {
                if (typeof prop !== 'string') return target[prop];

                const tagBruta = prop.trim();

                // Deteção e Execução Dinâmica do Motor Matemático (calc) dentro do Word
                if (tagBruta.startsWith('calc ')) {
                    // Remove a palavra 'calc' e aspas que envolvam a expressão
                    let expressao = tagBruta.replace(/^calc\s+/, '');
                    expressao = expressao.replace(/^["']|["']$/g, ''); // Remove aspas extras se houver

                    try {
                        // Substitui as variáveis da fórmula pelos números reais do formulário
                        let expressaoPreenchida = expressao.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, function (variavel) {
                            const valor = target[variavel.toLowerCase()];
                            if (valor !== undefined) {
                                return parseFloat(valor) || 0;
                            }
                            return variavel; // Mantém funções ou operadores matemáticos
                        });

                        // Executa a expressão de forma isolada e segura
                        const resultado = new Function('return ' + expressaoPreenchida)();
                        // Arredonda para no máximo 5 casas decimais (ex: 1.12345), mas remove zeros inúteis no final
                        return Number.isInteger(resultado) ? resultado : parseFloat(resultado.toFixed(5));
                    } catch (erro) {
                        console.error(`[Proxy Calc] Erro na fórmula do Word "${tagBruta}":`, erro.message);
                        return "[Erro no Cálculo]";
                    }
                }

                // Fluxo Normal: Ignora Case-Sensitivity mapeando tudo para minúsculas
                return target[tagBruta.toLowerCase()];
            }
        });

        const zipFinal = new PizZip();
        const serialLote = Date.now().toString(36).toUpperCase().slice(-5);
        const pastaDownloads = path.join(__dirname, '../public/downloads');

        // Garante que a pasta de downloads existe
        if (!fs.existsSync(pastaDownloads)) {
            fs.mkdirSync(pastaDownloads, { recursive: true });
        }

        // 2. Processamento do Lote de Ficheiros Word
        for (const idTemplate of templateIds) {
            const template = await Template.findOne({ _id: idTemplate, deletado: { $ne: true } });

            if (!template) {
                throw new Error(`Template ${idTemplate} não encontrado ou sem permissão.`);
            }

            // Validar permissão através do grupo
            const grupo = await TemplateGroup.findOne({ _id: template.id_grupo, deletado: { $ne: true } });
            if (!grupo) {
                throw new Error(`Template ${template.titulo} não pertence a um grupo ativo.`);
            }

            const workspaceId = user.cargo === 'mestra' ? user._id : user.id_mestra;
            if (grupo.id_mestra.toString() !== workspaceId.toString()) {
                throw new Error(`Template ${idTemplate} não encontrado ou sem permissão.`);
            }

            if (user.cargo === 'funcionario') {
                const temPerm = grupo.permissoes.some(p => p.id_usuario.toString() === user._id.toString());
                if (!temPerm) {
                    throw new Error(`Template ${idTemplate} não encontrado ou sem permissão.`);
                }
            }

            try {
                // Carrega o Buffer binário do Word original guardado no MongoDB para o PizZip
                const zip = new PizZip(template.arquivo_original);

                // Inicializa o Docxtemplater com suporte a delimitadores duplos {{ }}
                const doc = new Docxtemplater(zip, {
                    delimiters: { start: "{{", end: "}}" },
                    paragraphLoop: true,
                    linebreaks: true
                });

                // Injeta o nosso Proxy inteligente como fonte de dados única
                doc.setData(contextoInteligente);

                // Executa a compilação nativa (substitui textos sem quebrar XML, fontes ou estilos)
                doc.render();

                // Gera o Buffer binário final do novo arquivo Word processado
                const bufferGerado = doc.getZip().generate({ type: "nodebuffer" });

                // 3. Adiciona ao ZIP final
                const nomeBase = template.titulo
                    .replace(/[^a-zA-Z0-9_\-\sàáâãéêíóôõúçÀÁÂÃÉÊÍÓÔÕÚÇ]/g, '')
                    .trim()
                    .replace(/\s+/g, '_');
                const nomeFicheiro = `${nomeBase}_${serialLote}.docx`;

                zipFinal.file(nomeFicheiro, bufferGerado);

                // Grava também o ficheiro individual no disco por garantia/histórico
                fs.writeFileSync(path.join(pastaDownloads, nomeFicheiro), bufferGerado);

                // 4. Registo Histórico da Geração (Mongoose)
                const urlFicheiro = `/downloads/${nomeFicheiro}`;
                const novoDocumento = new DocumentoGerado({
                    id_template: template._id,
                    id_usuario: user._id,
                    dados_variaveis: valoresFormulario,
                    arquivo_url: urlFicheiro
                });

                await novoDocumento.save();

                documentosCompilados.push({
                    titulo: template.titulo,
                    idDocumento: novoDocumento._id,
                    arquivoUrl: urlFicheiro,
                    nomeFicheiro: nomeFicheiro,
                    isWord: true // Flag indicativa para a interface visual
                });

            } catch (error) {
                console.error(`[DocumentService] Erro ao processar o arquivo .docx de ${template.titulo}:`, error);
                throw new Error(`Falha ao processar a estrutura do Word para o template "${template.titulo}". Verifique a integridade das tags.`);
            }
        }

        // Gera o Buffer do ZIP final contendo todos os docs
        const zipFinalBuffer = zipFinal.generate({ type: "nodebuffer", compression: "DEFLATE" });
        const nomeZip = `Documentos_${serialLote}.zip`;
        fs.writeFileSync(path.join(pastaDownloads, nomeZip), zipFinalBuffer);

        return {
            zipUrl: `/downloads/${nomeZip}`,
            documentos: documentosCompilados
        };
    }
}

module.exports = new DocumentService();