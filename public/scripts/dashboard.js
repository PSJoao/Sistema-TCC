async function abrirModalReferencias(btn) {
    const nome = btn.getAttribute('data-nome');
    const docsStr = btn.getAttribute('data-docs');
    try {
        const docs = JSON.parse(docsStr);
        const titles = docs.map(d => d.titulo);
        ModalSystem.showList("Documentos do template: " + nome, titles);
    } catch (e) {
        console.error('Erro ao abrir modal de referências:', e);
        await ModalSystem.alert('Não foi possível carregar as referências.');
    }
}

async function confirmarExclusaoTemplate(id) {
    const confirmado = await ModalSystem.confirm('Tem a certeza que deseja eliminar este template e todos os seus documentos?');
    if (confirmado) {
        document.getElementById(`form-excluir-${id}`).submit();
    }
}

// Obter os funcionários a partir do atributo data do container
const container = document.getElementById('dashboard-container');
const funcionariosList = container ? JSON.parse(container.getAttribute('data-funcionarios') || '[]') : [];

async function abrirModalPermissoes(templateId, nomeTemplate, permissoesStr) {
    if (!funcionariosList || funcionariosList.length === 0) {
        await ModalSystem.alert('Você não tem nenhum funcionário cadastrado no momento. Cadastre-os em "Gestão de Usuários".');
        return;
    }

    let permissoesAtuais = [];
    try { permissoesAtuais = JSON.parse(permissoesStr || '[]'); } catch(e){}

    let html = `
        <p style="margin-bottom: 15px; color: var(--color-text-muted);">
            Selecione quais funcionários têm permissão para gerar este template, e se podem ou não editá-lo.
        </p>
        <div style="max-height: 300px; overflow-y: auto; padding-right: 10px; margin-bottom: 15px;">
    `;

    funcionariosList.forEach(func => {
        const temPerm = permissoesAtuais.find(p => p.id_usuario === func._id);
        const checkAtivo = temPerm ? 'checked' : '';
        const checkEdit = (temPerm && temPerm.pode_editar) ? 'checked' : '';
        
        html += `
            <div style="background: var(--color-bg-tertiary); padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 500; color: var(--color-text-main);">${func.nome}</span>
                    <span style="font-family: monospace; font-size: 0.85rem; color: var(--color-primary-light);">${func.email}</span>
                </div>
                <div style="display: flex; gap: 15px;">
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--color-text-main);">
                        <input type="checkbox" class="chk-acesso" data-id="${func._id}" ${checkAtivo}> Acesso
                    </label>
                    <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--color-text-main);">
                        <input type="checkbox" class="chk-editar" data-id="${func._id}" ${checkEdit}> Editar
                    </label>
                </div>
            </div>
        `;
    });

    html += `</div>
        <button class="btn btn-primary btn-block" onclick="salvarPermissoes('${templateId}')">Salvar Permissões</button>
    `;

    ModalSystem.show({
        title: `Acessos: ${nomeTemplate}`,
        content: html,
        width: '600px'
    });
}

async function salvarPermissoes(templateId) {
    const payload = [];
    
    // Coletar as checkbox marcadas
    const boxes = document.querySelectorAll('.chk-acesso');
    boxes.forEach(box => {
        if (box.checked) {
            const id = box.getAttribute('data-id');
            const boxEdit = document.querySelector(`.chk-editar[data-id="${id}"]`);
            payload.push({
                id_usuario: id,
                pode_editar: boxEdit ? boxEdit.checked : false
            });
        }
    });

    try {
        const res = await fetch(`/templates/${templateId}/permissoes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissoes: payload })
        });

        if (res.ok) {
            window.location.reload();
        } else {
            await ModalSystem.alert('Erro ao salvar permissões.');
        }
    } catch (e) {
        await ModalSystem.alert('Falha na comunicação com o servidor.');
    }
}
