(function() {
    const container = document.getElementById('editor-container');
    const grupoId = container ? container.getAttribute('data-grupo-id') : '';
    const isNovoCriado = container ? (container.getAttribute('data-novo-criado') === 'true') : false;
    const editForm = document.getElementById('editForm');
    const docList = document.getElementById('docList');
    const camposContainer = document.getElementById('camposContainer');
    const noCamposMessage = document.getElementById('noCamposMessage');
    const addDocInput = document.getElementById('addDocInput');
    const btnAdicionarDoc = document.getElementById('btnAdicionarDoc');
    const addDocStatus = document.getElementById('addDocStatus');
    const docsParaRemoverContainer = document.getElementById('docsParaRemoverContainer');

    // Flag para controlar se o formulário foi submetido pelo botão
    let formSubmetido = false;

    // Set de IDs de documentos marcados para remoção (client-side apenas)
    const docsRemovidos = new Set();

    // ========================================
    // BLOQUEAR ENTER de submeter o formulário
    // ========================================
    if (editForm) {
        editForm.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
            }
        });

        // ========================================
        // Controlar submit apenas pelo botão
        // ========================================
        editForm.addEventListener('submit', function(e) {
            if (!formSubmetido) {
                e.preventDefault();
                return;
            }

            // Verificar se há pelo menos 1 documento visível (não removido)
            const docsVisiveis = docList.querySelectorAll('.editor-doc-item:not(.doc-removido)');
            if (docsVisiveis.length === 0) {
                e.preventDefault();
                ModalSystem.alert('O template precisa ter pelo menos um documento. Adicione um documento antes de salvar.');
                formSubmetido = false;
                return;
            }
        });
    }

    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar && editForm) {
        btnSalvar.addEventListener('click', function() {
            formSubmetido = true;
            editForm.requestSubmit();
        });
    }

    // ========================================
    // Aviso ao sair sem salvar (criação)
    // ========================================
    if (isNovoCriado) {
        window.addEventListener('beforeunload', function(e) {
            if (!formSubmetido) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Confirmar ao clicar nos botões "Voltar" e "Cancelar"
        const btnVoltar = document.getElementById('btnVoltar');
        if (btnVoltar) {
            btnVoltar.addEventListener('click', async function(e) {
                if (!formSubmetido) {
                    e.preventDefault();
                    if (await ModalSystem.confirm('Você ainda não finalizou o template. Se sair agora, ele não será criado. Deseja sair?')) {
                        formSubmetido = true; // Desativa o beforeunload
                        window.location.href = '/dashboard';
                    }
                }
            });
        }

        const btnCancelar = document.getElementById('btnCancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', async function(e) {
                if (!formSubmetido) {
                    e.preventDefault();
                    if (await ModalSystem.confirm('Você ainda não finalizou o template. Se sair agora, ele não será criado. Deseja sair?')) {
                        formSubmetido = true;
                        window.location.href = '/dashboard';
                    }
                }
            });
        }
    }

    // ========================================
    // Habilitar/desabilitar botão de adicionar
    // ========================================
    if (addDocInput && btnAdicionarDoc) {
        addDocInput.addEventListener('change', function() {
            btnAdicionarDoc.disabled = !this.files || this.files.length === 0;
        });
    }

    // ========================================
    // Adicionar documento via AJAX
    // ========================================
    if (btnAdicionarDoc && addDocInput && addDocStatus) {
        btnAdicionarDoc.addEventListener('click', async function() {
            const files = addDocInput.files;
            if (!files || files.length === 0) return;

            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('templates', files[i]);
            }

            btnAdicionarDoc.disabled = true;
            addDocStatus.style.display = 'block';

            try {
                const response = await fetch(`/templates/${grupoId}/adicionar-documento-ajax`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao adicionar documento.');
                }

                // Se houve duplicatas puladas, verificar se alguma era um doc removido e des-remover
                if (data.duplicadosPulados && data.duplicadosPulados.length > 0) {
                    data.duplicadosPulados.forEach(function(titulo) {
                        // Procurar na lista de docs removidos se algum tem esse título
                        docList.querySelectorAll('.editor-doc-item.doc-removido').forEach(function(li) {
                            const docTitulo = li.querySelector('.editor-doc-name');
                            if (docTitulo && docTitulo.textContent === titulo) {
                                const docId = li.getAttribute('data-doc-id');
                                // Des-remover: restaurar visual
                                li.classList.remove('doc-removido');
                                li.style.opacity = '';
                                li.style.textDecoration = '';
                                const btn = li.querySelector('button');
                                if (btn) {
                                    btn.textContent = 'Remover';
                                    btn.disabled = false;
                                    btn.classList.remove('btn-secondary');
                                    btn.classList.add('btn-danger');
                                }
                                // Remover do set e do hidden input
                                docsRemovidos.delete(docId);
                                const hiddenInput = docsParaRemoverContainer.querySelector(`input[value="${docId}"]`);
                                if (hiddenInput) hiddenInput.remove();
                            }
                        });
                    });
                }

                // Re-renderizar lista de docs apenas se houve novos (não duplicatas)
                if (data.novosTemplates && data.novosTemplates.length > 0) {
                    // Renderizar a lista completa mas preservar o estado de remoção dos docs pendentes
                    renderDocListPreservandoRemocoes(data.todosTemplates);
                }

                // Atualizar campos (excluindo docs ainda marcados para remoção)
                if (docsRemovidos.size > 0) {
                    recalcularCamposLocalmente();
                } else {
                    renderCampos(data.camposComIndicadores);
                }

                // Limpar input
                addDocInput.value = '';
                btnAdicionarDoc.disabled = true;

            } catch (error) {
                await ModalSystem.alert('Erro ao adicionar documento: ' + error.message);
            } finally {
                addDocStatus.style.display = 'none';
            }
        });
    }

    // ========================================
    // Remover documento (CLIENT-SIDE apenas)
    // Não faz chamada ao servidor.
    // Marca o doc como removido e adiciona hidden input.
    // A remoção efetiva ocorre no submit do formulário.
    // ========================================
    if (docList) {
        docList.addEventListener('click', async function(e) {
            const btn = e.target.closest('.btn-remover-doc');
            if (!btn) return;

            const docId = btn.getAttribute('data-doc-id');
            const docTitulo = btn.getAttribute('data-doc-titulo');

            if (!(await ModalSystem.confirm(`Remover o documento '${docTitulo}' deste template?`))) return;

            // Verificar se é o último documento visível
            const docsVisiveis = docList.querySelectorAll('.editor-doc-item:not(.doc-removido)');
            if (docsVisiveis.length <= 1) {
                await ModalSystem.alert('O template precisa ter pelo menos um documento. Não é possível remover o último.');
                return;
            }

            // Marcar como removido visualmente
            const li = btn.closest('.editor-doc-item');
            li.classList.add('doc-removido');
            li.style.opacity = '0.4';
            li.style.textDecoration = 'line-through';
            btn.textContent = 'Removido';
            btn.disabled = true;
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-secondary');

            // Adicionar hidden input para enviar no submit
            docsRemovidos.add(docId);
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = 'docsParaRemover';
            hidden.value = docId;
            docsParaRemoverContainer.appendChild(hidden);

            // Recalcular campos exibidos (excluindo docs removidos)
            recalcularCamposLocalmente();
        });
    }

    // ========================================
    // Recalcular campos localmente ao remover docs
    // Usa dados dos templates que ainda estão visíveis
    // ========================================
    function recalcularCamposLocalmente() {
        // Buscar os dados atuais do servidor para recalcular excluindo removidos
        fetch(`/templates/${grupoId}/campos-atualizados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docsRemovidos: Array.from(docsRemovidos) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderCampos(data.camposComIndicadores);
            }
        })
        .catch(error => {
            console.error('Erro ao recalcular campos:', error);
        });
    }

    // ========================================
    // Renderizar lista de documentos
    // ========================================
    function renderDocList(templates) {
        docList.innerHTML = '';

        templates.forEach(function(t) {
            const li = document.createElement('li');
            li.className = 'editor-doc-item';
            li.setAttribute('data-doc-id', t._id);

            li.innerHTML = `
                <div class="editor-doc-info">
                    <span class="editor-doc-icon"><i class="ph ph-file-text"></i></span>
                    <div>
                        <div class="editor-doc-name">${escapeHtml(t.titulo)}</div>
                        <div class="editor-doc-campos">${t.campos.length} campo(s) extraído(s)</div>
                    </div>
                </div>
                <button type="button" class="btn btn-danger btn-sm btn-remover-doc"
                    data-doc-id="${t._id}" data-doc-titulo="${escapeHtml(t.titulo)}">
                    Remover
                </button>
            `;

            docList.appendChild(li);
        });
    }

    // ========================================
    // Renderizar lista de documentos preservando estado de remoção
    // ========================================
    function renderDocListPreservandoRemocoes(templates) {
        docList.innerHTML = '';

        templates.forEach(function(t) {
            const isRemovido = docsRemovidos.has(t._id);
            const li = document.createElement('li');
            li.className = 'editor-doc-item' + (isRemovido ? ' doc-removido' : '');
            li.setAttribute('data-doc-id', t._id);
            
            if (isRemovido) {
                li.style.opacity = '0.4';
                li.style.textDecoration = 'line-through';
            }

            li.innerHTML = `
                <div class="editor-doc-info">
                    <span class="editor-doc-icon"><i class="ph ph-file-text"></i></span>
                    <div>
                        <div class="editor-doc-name">${escapeHtml(t.titulo)}</div>
                        <div class="editor-doc-campos">${t.campos.length} campo(s) extraído(s)</div>
                    </div>
                </div>
                <button type="button" class="btn btn-sm ${isRemovido ? 'btn-secondary' : 'btn-danger'} btn-remover-doc"
                    data-doc-id="${t._id}" data-doc-titulo="${escapeHtml(t.titulo)}"
                    ${isRemovido ? 'disabled' : ''}>
                    ${isRemovido ? 'Removido' : 'Remover'}
                </button>
            `;

            docList.appendChild(li);
        });
    }

    // ========================================
    // Renderizar campos com indicadores
    // ========================================
    function renderCampos(campos) {
        // Preservar valores editados pelo usuário antes de re-renderizar
        const valoresAtuais = {};
        camposContainer.querySelectorAll('.field-editor-row').forEach(function(row) {
            const campo = row.getAttribute('data-campo');
            const labelInput = row.querySelector('input[name="labels[' + campo + ']"]');
            const placeholderInput = row.querySelector('input[name="placeholders[' + campo + ']"]');
            if (labelInput) valoresAtuais[campo] = { label: labelInput.value, placeholder: placeholderInput ? placeholderInput.value : '' };
        });

        // Remover todas as rows de campo existentes (mantendo o noCamposMessage)
        camposContainer.querySelectorAll('.field-editor-row').forEach(function(row) {
            row.remove();
        });

        if (!campos || campos.length === 0) {
            noCamposMessage.style.display = 'block';
            return;
        }

        noCamposMessage.style.display = 'none';

        campos.forEach(function(c) {
            const row = document.createElement('div');
            row.className = 'field-editor-row';
            row.setAttribute('data-campo', c.campo);

            // Usar valor preservado se existir, senão usar o valor do servidor
            const labelVal = (valoresAtuais[c.campo] && valoresAtuais[c.campo].label) || c.label;
            const placeholderVal = (valoresAtuais[c.campo] && valoresAtuais[c.campo].placeholder) || c.placeholder;

            const jsonDocs = escapeHtml(JSON.stringify(c.documentos)).replace(/'/g, "&#39;");
            const badgesHtml = `
                <button type="button" class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 0.75rem;" 
                    onclick="ModalSystem.showList('Referências: ${escapeHtml(c.campo)}', JSON.parse('${jsonDocs}'))">
                    Ver Referências
                </button>
            `;

            row.innerHTML = `
                <div class="field-editor-header">
                    <span class="field-editor-name">${escapeHtml(c.campo)}</span>
                    <div class="field-badges">
                        ${badgesHtml}
                    </div>
                </div>
                <div class="field-editor-inputs">
                    <div class="field-editor-input-group">
                        <span class="field-editor-input-label">Label</span>
                        <input type="text" name="labels[${escapeHtml(c.campo)}]" value="${escapeHtml(labelVal)}"
                            class="form-control" placeholder="Label do campo">
                    </div>
                    <div class="field-editor-input-group">
                        <span class="field-editor-input-label">Placeholder</span>
                        <input type="text" name="placeholders[${escapeHtml(c.campo)}]" value="${escapeHtml(placeholderVal)}"
                            class="form-control" placeholder="Texto de ajuda">
                    </div>
                </div>
            `;

            camposContainer.insertBefore(row, noCamposMessage);
        });
    }

    // ========================================
    // Utilitário: escape HTML
    // ========================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // Checar se há campos visíveis na carga inicial
    // ========================================
    if (camposContainer && camposContainer.querySelectorAll('.field-editor-row').length === 0) {
        noCamposMessage.style.display = 'block';
    }
})();
