const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const fileListContainer = document.getElementById('fileListContainer');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');
const submitBtn = document.getElementById('submitBtn');

// Usaremos DataTransfer para acumular arquivos de várias seleções/arrastes
let dataTransfer = new DataTransfer();

if (dropArea && fileInput) {
    // Despoleta o seletor de ficheiros ao clicar na área
    dropArea.addEventListener('click', () => fileInput.click());

    // Efeitos visuais ao arrastar ficheiros sobre a zona
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
        }, false);
    });

    // Captura os ficheiros largados na zona
    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        handleFiles(dt.files);
    });

    // Captura a seleção de ficheiros convencional
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

async function handleFiles(newFiles) {
    // Verificar limite de 100 arquivos no total
    if (dataTransfer.items.length + newFiles.length > 100) {
        await ModalSystem.alert('Erro: O sistema aceita no máximo 100 templates por lote. Limite excedido.');
        return;
    }

    // Evitar duplicatas exatas pelo nome do arquivo na mesma sessão de upload
    const existingNames = new Set(Array.from(dataTransfer.files).map(f => f.name));

    Array.from(newFiles).forEach(file => {
        // Só adiciona se o formato for válido (.txt ou .docx) e se não for duplicado
        const validExtensions = /\.(docx|txt)$/i;
        if (validExtensions.test(file.name) && !existingNames.has(file.name)) {
            dataTransfer.items.add(file);
            existingNames.add(file.name);
        } else if (!validExtensions.test(file.name)) {
            console.warn('Arquivo ignorado (formato inválido):', file.name);
        }
    });

    // Sincronizar com o input form verdadeiro
    if (fileInput) {
        fileInput.files = dataTransfer.files;
    }
    
    updateUI();
}

// Atualiza a interface (lista de ficheiros e botão)
function updateUI() {
    if (!fileList || !fileListContainer || !submitBtn || !fileCount || !fileInput) return;

    fileList.innerHTML = '';
    const totalFiles = dataTransfer.files.length;

    if (totalFiles > 0) {
        fileCount.textContent = totalFiles;
        fileListContainer.style.display = 'block';
        submitBtn.disabled = false;

        Array.from(dataTransfer.files).forEach((file, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            
            li.innerHTML = `
                <span><span class="card-doc-icon"><i class="ph ph-file-text"></i></span> ${escapeHtml(file.name)}</span>
                <button type="button" class="btn btn-danger btn-sm" onclick="removeFile(${index})" style="padding: 2px 8px;"><i class="ph ph-x"></i></button>
            `;
            fileList.appendChild(li);
        });
    } else {
        fileListContainer.style.display = 'none';
        submitBtn.disabled = true;
        fileInput.files = new DataTransfer().files; // Limpar form verdadeiro
    }
}

// Permite remover arquivos individualmente da lista antes de enviar
window.removeFile = function(index) {
    const dt = new DataTransfer();
    const files = Array.from(dataTransfer.files);
    
    // Adicionar todos exceto o removido
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }
    
    dataTransfer = dt;
    if (fileInput) {
        fileInput.files = dataTransfer.files;
    }
    updateUI();
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
