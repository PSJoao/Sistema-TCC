const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Corrigir codificação do nome do ficheiro (de latin1 para utf8) para preservar acentos, Ç, ~, etc.
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // Agora aceitamos Word (.docx) e Texto (.txt)
    const allowedExtensions = /\.(docx|txt)$/i;

    // O Multer também verifica o mimetype para evitar arquivos renomeados maliciosamente
    const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'text/plain' // .txt
    ];

    const isExtensionValid = allowedExtensions.test(path.extname(file.originalname));
    const isMimeValid = allowedMimeTypes.includes(file.mimetype);

    if (isExtensionValid && isMimeValid) {
        cb(null, true);
    } else {
        cb(new Error(`Formato inválido (${file.originalname}). Por favor, envie apenas documentos do Microsoft Word (.docx) ou Texto (.txt).`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        files: 100,
        fileSize: 10 * 1024 * 1024 // Aumentei para 10MB para garantir que Word com imagens não sejam bloqueados
    }
});

module.exports = upload;