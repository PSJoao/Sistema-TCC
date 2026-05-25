const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

// Importação dos Motores de Rotas Oficiais da Aplicação
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');

// Importação dos Helpers Matemáticos e Utilitários Customizados para o Handlebars
const customHelpers = require('./helpers/handlebars-helpers');

// 1. Carregar as variáveis de ambiente protegidas (.env)
dotenv.config();

// 2. Inicializar a instância do servidor Express
const app = express();

// 3. Estabelecer a ligação persistente à Base de Dados MongoDB
connectDB();

// 4. Middlewares de Configuração Global do Express
app.use(express.json()); // Permite ler pacotes JSON nativos
app.use(express.urlencoded({ extended: true })); // Permite processar submissões de formulários HTML
app.use(cookieParser()); // Permite interceptar e ler os cookies (essencial para o JWT)

// 5. Definição da pasta pública de ficheiros estáticos (CSS, imagens, scripts)
app.use(express.static(path.join(__dirname, 'public')));

// 6. Configuração e Ativação do Motor de Templates Handlebars
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: customHelpers,
    // Adicione este bloco runtimeOptions para liberar a leitura de objetos do Mongoose no frontend
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// 7. Definição e Mapeamento das Rotas da Aplicação
// Rota Raiz: Redireciona automaticamente qualquer utilizador inicial para o ecrã de login
app.get('/', (req, res) => res.redirect('/auth/login'));

// Vinculação dos módulos de rotas criados nas fases anteriores
app.use('/auth', authRoutes);         // Gerencia login e logout
app.use('/', templateRoutes);        // Gerencia dashboard, telas de upload e remoção de templates
app.use('/documentos', documentRoutes); // Gerencia a compilação do super formulário unificado
app.use('/usuarios', userRoutes);       // Gerencia o CRUD de usuários pela Mestra

// 8. Inicialização do Servidor e Escuta na Porta Definida
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`===========================================================`);
    console.log(`PLATAFORMA DE AUTOMAÇÃO DE DOCUMENTOS INICIADA COM SUCESSO`);
    console.log(`Acesso: http://localhost:${PORT}`);
    console.log(`===========================================================`);
});