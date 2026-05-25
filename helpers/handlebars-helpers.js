module.exports = {
    /**
     * Helper de Igualdade (eq)
     * Muito útil para lógicas condicionais no HTML (ex: marcar um menu como 'active')
     */
    eq: function (v1, v2) {
        return v1 === v2;
    },

    /**
     * Helper de Diferença (ne)
     */
    ne: function (v1, v2) {
        return v1 !== v2;
    },

    /**
     * Motor Matemático (calc)
     * Resolve expressões matemáticas complexas injetando os valores do formulário.
     * * Como usar no documento Word/Template: 
     * {{calc "(conta1 - conta2 + conta3) / conta1"}}
     */
    calc: function (expressao, options) {
        try {
            // 'this' representa o contexto atual com todas as variáveis enviadas pelo formulário
            const contexto = this;

            // Encontra todas as palavras (variáveis) na expressão matemática
            // Exemplo: encontra "conta1", "conta2" dentro da string
            let expressaoPreenchida = expressao.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, function (variavel) {

                // Se a variável existir nos dados do formulário, substituímos pelo valor numérico
                if (contexto[variavel] !== undefined) {
                    // Tenta converter para número, se falhar ou for vazio, assume 0 para não quebrar o cálculo
                    return parseFloat(contexto[variavel]) || 0;
                }

                // Se não for uma variável do contexto (pode ser uma função matemática nativa como Math.PI), mantém
                return variavel;
            });

            // Executa a expressão matemática de forma segura isolando num construtor de Função
            const resultado = new Function('return ' + expressaoPreenchida)();

            // Retorna o resultado. Se for decimal, formata para no máximo 5 casas
            return Number.isInteger(resultado) ? resultado : parseFloat(resultado.toFixed(5));

        } catch (erro) {
            console.error(`[Helper Calc] Erro ao calcular a expressão "${expressao}":`, erro.message);
            return "[Erro no Cálculo]";
        }
    },

    /**
     * Helper para formatar Moeda (BRL)
     * Uso: {{moeda valorFinal}}
     */
    moeda: function (valor) {
        if (!valor || isNaN(valor)) return valor;
        return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    /**
     * Helper para formatar Data
     * Uso: {{data data_criacao}}
     */
    data: function (data) {
        if (!data) return '';
        const d = new Date(data);
        return d.toLocaleDateString('pt-BR');
    },

    /**
     * Helper para serializar objetos JSON para uso em scripts do lado do cliente
     * Uso: {{{json objeto}}}
     */
    json: function (contexto) {
        return JSON.stringify(contexto);
    }
};