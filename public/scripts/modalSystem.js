// public/scripts/modalSystem.js
const ModalSystem = (function () {
    let modalOverlayEl, modalEl, modalTitleEl, modalContentEl, modalCloseBtnEl;

    function init() {
        // Se já existir, não criar novamente
        if (document.getElementById('customModalOverlay')) {
            assignElements();
            return true;
        }

        // Inject modal HTML
        const modalHTML = `
            <div class="custom-modal-overlay" id="customModalOverlay"></div>
            <div class="custom-modal" id="customModal">
                <div class="custom-modal-header">
                    <h3 class="custom-modal-title" id="customModalTitle"></h3>
                    <button class="custom-modal-close" id="customModalCloseBtn">&times;</button>
                </div>
                <div class="custom-modal-body" id="customModalContent">
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        assignElements();
        return true;
    }

    function assignElements() {
        modalOverlayEl = document.getElementById('customModalOverlay');
        modalEl = document.getElementById('customModal');
        modalTitleEl = document.getElementById('customModalTitle');
        modalContentEl = document.getElementById('customModalContent');
        modalCloseBtnEl = document.getElementById('customModalCloseBtn');

        modalOverlayEl.addEventListener('click', closeModal);
        modalCloseBtnEl.addEventListener('click', closeModal);
    }

    function closeModal() {
        if (modalEl && modalOverlayEl) {
            modalEl.classList.remove('visible');
            modalOverlayEl.classList.remove('visible');

            setTimeout(() => {
                modalEl.style.display = 'none';
                modalOverlayEl.style.display = 'none';
            }, 200);
        }
    }

    function openModal(title, htmlContent) {
        if (!modalEl) init();

        modalTitleEl.textContent = title || 'Informação';
        modalContentEl.innerHTML = htmlContent || '';

        modalOverlayEl.style.display = 'block';
        modalEl.style.display = 'block';

        // Force reflow
        void modalEl.offsetHeight;

        modalOverlayEl.classList.add('visible');
        modalEl.classList.add('visible');
    }

    function showGeneric(options) {
        if (!modalEl) init();

        if (options.width) {
            modalEl.style.maxWidth = options.width;
        } else {
            modalEl.style.maxWidth = '500px'; // default
        }

        openModal(options.title, options.content);
    }

    function customConfirm(message, title = 'Confirmação') {
        return new Promise((resolve) => {
            const html = `
                <div style="margin-bottom: 20px; color: var(--color-text-main); font-size: 1rem;">
                    ${message}
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn btn-secondary" id="modalBtnCancel">Cancelar</button>
                    <button class="btn btn-primary" id="modalBtnConfirm">Confirmar</button>
                </div>
            `;
            
            showGeneric({ title, content: html, width: '400px' });

            const btnConfirm = document.getElementById('modalBtnConfirm');
            const btnCancel = document.getElementById('modalBtnCancel');

            // Override closeModal temporarily to resolve false if closed via X or Overlay
            const originalClose = modalCloseBtnEl.onclick;
            
            const cleanup = (result) => {
                btnConfirm.removeEventListener('click', onConfirm);
                btnCancel.removeEventListener('click', onCancel);
                modalOverlayEl.removeEventListener('click', onCancel);
                modalCloseBtnEl.removeEventListener('click', onCancel);
                
                // Re-bind default close
                modalOverlayEl.addEventListener('click', closeModal);
                modalCloseBtnEl.addEventListener('click', closeModal);
                
                closeModal();
                resolve(result);
            };

            const onConfirm = () => cleanup(true);
            const onCancel = () => cleanup(false);

            btnConfirm.addEventListener('click', onConfirm);
            btnCancel.addEventListener('click', onCancel);
            
            // Remove previous event listeners for close to handle our promise
            modalOverlayEl.removeEventListener('click', closeModal);
            modalCloseBtnEl.removeEventListener('click', closeModal);
            
            modalOverlayEl.addEventListener('click', onCancel);
            modalCloseBtnEl.addEventListener('click', onCancel);
        });
    }

    function customAlert(message, title = 'Aviso') {
        return new Promise((resolve) => {
            const html = `
                <div style="margin-bottom: 20px; color: var(--color-text-main); font-size: 1rem;">
                    ${message}
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary" id="modalBtnOk">OK</button>
                </div>
            `;
            
            showGeneric({ title, content: html, width: '400px' });

            const btnOk = document.getElementById('modalBtnOk');

            const cleanup = () => {
                btnOk.removeEventListener('click', onOk);
                modalOverlayEl.removeEventListener('click', onOk);
                modalCloseBtnEl.removeEventListener('click', onOk);
                
                modalOverlayEl.addEventListener('click', closeModal);
                modalCloseBtnEl.addEventListener('click', closeModal);
                
                closeModal();
                resolve();
            };

            const onOk = () => cleanup();

            btnOk.addEventListener('click', onOk);
            
            modalOverlayEl.removeEventListener('click', closeModal);
            modalCloseBtnEl.removeEventListener('click', closeModal);
            
            modalOverlayEl.addEventListener('click', onOk);
            modalCloseBtnEl.addEventListener('click', onOk);
        });
    }

    return {
        initialize: function () {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        },
        showList: function (title, listItems) {
            const listHtml = `
                <ul class="modal-list">
                    ${listItems.map(item => `<li><span class="card-doc-icon"><i class="ph ph-file-text"></i></span> ${item}</li>`).join('')}
                </ul>
            `;
            // Redefine width for list to default
            if (modalEl) modalEl.style.maxWidth = '500px';
            openModal(title, listHtml);
        },
        show: showGeneric,
        confirm: customConfirm,
        alert: customAlert,
        close: closeModal
    };
})();

window.ModalSystem = ModalSystem;
ModalSystem.initialize();
