function abrirModalCriarUsuario() {
    const container = document.getElementById('gestao-usuarios-container');
    const mestraAlias = container ? container.getAttribute('data-alias') : '';

    const conteudoModal = `
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: var(--color-text-main);">Nome Completo</label>
            <input type="text" id="novoNome" class="form-control" placeholder="Nome do colaborador" required>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: var(--color-text-main);">Nome de Usuário (Login)</label>
            <div style="display: flex; align-items: center; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding-right: 12px;">
                <input type="text" id="novoUser" class="form-control" placeholder="ex: jose" required style="border: none; background: transparent; box-shadow: none;">
                <span style="color: var(--color-text-muted); font-weight: bold;">@${mestraAlias}</span>
            </div>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: var(--color-text-main);">Cargo</label>
            <select id="novoCargo" class="form-control" required style="background: var(--color-bg-tertiary);">
                <option value="funcionario">Funcionário (Acesso Restrito)</option>
                <option value="admin">Administrador (Acesso Total e Edição)</option>
            </select>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: var(--color-text-main);">Senha</label>
            <input type="password" id="novaSenha" class="form-control" placeholder="Defina uma senha" required>
        </div>
        <button class="btn btn-primary btn-block mt-3" onclick="submeterNovoUsuario()">Salvar Usuário</button>
    `;
    
    ModalSystem.show({
        title: "Criar Novo Usuário",
        content: conteudoModal,
        width: '500px'
    });
}

async function submeterNovoUsuario() {
    const nome = document.getElementById('novoNome').value;
    const username = document.getElementById('novoUser').value;
    const cargo = document.getElementById('novoCargo').value;
    const password = document.getElementById('novaSenha').value;

    if(!nome || !username || !password) {
        await ModalSystem.alert("Preencha todos os campos.");
        return;
    }

    try {
        const res = await fetch('/usuarios/criar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, username, cargo, password })
        });
        const data = await res.json();
        
        if(data.error) {
            await ModalSystem.alert(data.error);
        } else {
            window.location.reload();
        }
    } catch (e) {
        await ModalSystem.alert("Erro ao criar usuário");
    }
}

async function alternarStatus(id) {
    if(!(await ModalSystem.confirm("Tem certeza que deseja alterar o status deste usuário?"))) return;
    try {
        await fetch(`/usuarios/${id}/status`, { method: 'PUT' });
        window.location.reload();
    } catch (e) {
        await ModalSystem.alert("Erro ao alterar status");
    }
}

async function excluirUsuario(id) {
    if(!(await ModalSystem.confirm("Tem certeza que deseja excluir permanentemente este usuário? Esta ação não pode ser desfeita."))) return;
    try {
        await fetch(`/usuarios/${id}`, { method: 'DELETE' });
        window.location.reload();
    } catch (e) {
        await ModalSystem.alert("Erro ao excluir usuário");
    }
}

async function alterarCargo(id, cargo) {
    if(!(await ModalSystem.confirm("Tem certeza que deseja alterar o cargo deste usuário?"))) {
        window.location.reload();
        return;
    }
    try {
        const res = await fetch(`/usuarios/${id}/cargo`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cargo })
        });
        const data = await res.json();
        
        if(data.error) {
            await ModalSystem.alert(data.error);
            window.location.reload();
        } else {
            window.location.reload();
        }
    } catch (e) {
        await ModalSystem.alert("Erro ao alterar cargo");
        window.location.reload();
    }
}

// Filtro de busca inteligente local
const inputBusca = document.getElementById('buscaFuncionario');
if (inputBusca) {
    inputBusca.addEventListener('input', function(e) {
        const termo = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const linhas = document.querySelectorAll('tbody tr');
        
        linhas.forEach(linha => {
            // Ignorar a linha de "Nenhum usuário encontrado" se houver
            if (linha.cells.length === 1 && linha.cells[0].getAttribute('colspan') === '5') {
                return;
            }
            
            const nome = (linha.cells[0].innerText || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const email = (linha.cells[1].innerText || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            if (nome.includes(termo) || email.includes(termo)) {
                linha.style.display = '';
            } else {
                linha.style.display = 'none';
            }
        });
    });
}
