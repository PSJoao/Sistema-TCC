/**
 * Script de Teste Automatizado com Puppeteer
 * Captura screenshots de todas as telas do sistema AutoDocs
 * para o relatório de Resultados e Discussão do TCC.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'Referencias', 'Screenshots-TCC');

// Dados de teste
const MESTRA_DATA = {
    nome: 'João Pedro Silva',
    email: 'joaopedro@tccautodocs.com',
    password: 'SenhaTCC2025!',
    alias: 'tccdemo'
};

const FUNCIONARIO_DATA = {
    nome: 'Maria Santos',
    username: 'mariasantos',
    password: 'Func2025!',
    cargo: 'funcionario'
};

// Templates de teste
const TEMPLATE_CONTRATO = path.join(__dirname, 'contrato_prestacao_servico.docx');
const TEMPLATE_TERMO = path.join(__dirname, 'termo_confidencialidade.docx');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(page, name, description) {
    const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`✅ Screenshot: ${name} — ${description}`);
    return filepath;
}

async function main() {
    // Criar diretório de screenshots
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    console.log('🚀 Iniciando teste automatizado do AutoDocs...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: { width: 1366, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        // ============================================================
        // FASE 1: TELA DE LOGIN (Estado Inicial)
        // ============================================================
        console.log('📋 FASE 1: Tela de Autenticação');
        await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '01_tela_login', 'Tela de login do sistema');

        // ============================================================
        // FASE 2: TELA DE REGISTRO DE CONTA MESTRA
        // ============================================================
        console.log('📋 FASE 2: Registro de Conta Mestra');
        await page.goto(`${BASE_URL}/auth/register`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '02_tela_registro', 'Tela de registro de workspace');

        // Preencher o formulário de registro
        await page.type('#nome', MESTRA_DATA.nome);
        await page.type('#email', MESTRA_DATA.email);
        await page.type('#alias', MESTRA_DATA.alias);
        await page.type('#password', MESTRA_DATA.password);
        await delay(300);
        await screenshot(page, '03_registro_preenchido', 'Formulário de registro preenchido');

        // Submeter o registro
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]')
        ]);
        await delay(500);
        await screenshot(page, '04_registro_sucesso', 'Feedback de registro bem-sucedido');

        // ============================================================
        // FASE 3: LOGIN COM CONTA MESTRA
        // ============================================================
        console.log('📋 FASE 3: Login com conta Mestra');
        await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
        await page.type('#email', MESTRA_DATA.email);
        await page.type('#password', MESTRA_DATA.password);
        await delay(300);
        await screenshot(page, '05_login_preenchido', 'Login preenchido com credenciais da Mestra');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]')
        ]);
        await delay(500);
        await screenshot(page, '06_dashboard_vazio', 'Dashboard inicial sem templates');

        // ============================================================
        // FASE 4: UPLOAD DE TEMPLATES
        // ============================================================
        console.log('📋 FASE 4: Upload de Templates');
        await page.goto(`${BASE_URL}/upload`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '07_tela_upload', 'Tela de upload de templates');

        // Preencher nome do template
        await page.type('#nomeGrupo', 'Documentos Contratuais - Prestação de Serviços');

        // Upload dos dois documentos
        const fileInput = await page.$('#fileInput');
        await fileInput.uploadFile(TEMPLATE_CONTRATO, TEMPLATE_TERMO);
        await delay(1000);
        await screenshot(page, '08_upload_arquivos_selecionados', 'Arquivos selecionados para upload');

        // Submeter o upload
        // O botão pode ser habilitado pelo JS. Vamos esperar
        await page.evaluate(() => {
            document.getElementById('submitBtn').disabled = false;
        });
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
            page.click('#submitBtn')
        ]);
        await delay(500);
        await screenshot(page, '09_tela_editar_template', 'Tela de configuração do template recém-criado');

        // ============================================================
        // FASE 5: EDIÇÃO DE LABELS E PLACEHOLDERS
        // ============================================================
        console.log('📋 FASE 5: Configuração de Labels e Placeholders');
        // Tela de edição já está carregada
        await screenshot(page, '10_campos_extraidos', 'Campos dinâmicos extraídos automaticamente dos documentos');

        // Clicar em Finalizar
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('#btnSalvar')
        ]);
        await delay(500);
        await screenshot(page, '11_dashboard_com_template', 'Dashboard com o template criado');

        // ============================================================
        // FASE 6: GERAÇÃO DE DOCUMENTOS
        // ============================================================
        console.log('📋 FASE 6: Geração de Documentos');
        
        // Clicar no botão Gerar do primeiro template
        const gerarBtn = await page.$('a.btn.btn-primary.btn-sm');
        if (gerarBtn) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                gerarBtn.click()
            ]);
        }
        await delay(500);
        await screenshot(page, '12_formulario_geracao', 'Formulário unificado para geração de documentos');

        // Preencher os campos do formulário com dados de teste
        // Vou preencher todos os inputs visíveis do tipo text
        const inputs = await page.$$('input[type="text"][name^="valores"]');
        const testValues = {
            'nome_contratante': 'Empresa Alpha Ltda.',
            'cpf_cnpj_contratante': '12.345.678/0001-99',
            'endereco_contratante': 'Rua das Flores, 100 - Centro, São Paulo/SP',
            'nome_contratado': 'Tech Solutions S.A.',
            'cpf_cnpj_contratado': '98.765.432/0001-11',
            'endereco_contratado': 'Av. Paulista, 2000 - Bela Vista, São Paulo/SP',
            'descricao_servico': 'Desenvolvimento e manutenção de sistema web corporativo',
            'valor_servico': '15000',
            'prazo_execucao': '90 dias úteis',
            'data_contrato': '01/06/2025',
            'foro': 'São Paulo/SP',
            'nome_empresa': 'Empresa Alpha Ltda.',
            'nome_funcionario': 'Carlos Roberto Mendes',
            'cargo_funcionario': 'Analista de Sistemas Sênior',
            'data_assinatura': '01/06/2025',
        };
        
        for (const input of inputs) {
            const nameAttr = await page.evaluate(el => el.name, input);
            // Extract the field name from "valores[field_name]"
            const match = nameAttr.match(/valores\[(.+)\]/);
            if (match) {
                const fieldName = match[1];
                const value = testValues[fieldName] || `Valor de Teste - ${fieldName}`;
                await input.click({ clickCount: 3 }); // Select all
                await input.type(value);
            }
        }
        
        await delay(500);
        await screenshot(page, '13_formulario_preenchido', 'Formulário preenchido com dados de teste');

        // Submeter para gerar
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
            page.click('button[type="submit"]')
        ]);
        await delay(500);
        await screenshot(page, '14_resultado_geracao', 'Tela de resultado - documentos gerados com sucesso');

        // ============================================================
        // FASE 7: GESTÃO DE USUÁRIOS
        // ============================================================
        console.log('📋 FASE 7: Gestão de Usuários');
        await page.goto(`${BASE_URL}/usuarios`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '15_gestao_usuarios_vazio', 'Tela de gestão de usuários (vazia)');

        // Criar um funcionário via API (direto no fetch)
        const criarResult = await page.evaluate(async (funcData) => {
            const resp = await fetch('/usuarios/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funcData)
            });
            return await resp.json();
        }, FUNCIONARIO_DATA);
        
        console.log('   Resultado criação funcionário:', criarResult);

        // Recarregar
        await page.reload({ waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '16_gestao_usuarios_com_func', 'Gestão de usuários com funcionário cadastrado');

        // ============================================================
        // FASE 8: TUTORIAL / MANUAL
        // ============================================================
        console.log('📋 FASE 8: Tutorial');
        await page.goto(`${BASE_URL}/tutorial`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '17_tutorial', 'Manual de uso do sistema');

        // ============================================================
        // FASE 9: GERENCIAR PERMISSÕES (Botão no Dashboard)
        // ============================================================
        console.log('📋 FASE 9: Permissões e Dashboard com conteúdo');
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '18_dashboard_final', 'Dashboard completo com template e ações');

        // ============================================================
        // FASE 10: RESPONSIVIDADE (Mobile)
        // ============================================================
        console.log('📋 FASE 10: Responsividade Mobile');
        await page.setViewport({ width: 375, height: 812 }); // iPhone X
        
        await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '19_mobile_login', 'Tela de login em dispositivo móvel');

        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '20_mobile_dashboard', 'Dashboard em dispositivo móvel');

        // Menu hambúrguer
        const menuToggle = await page.$('#mobile-menu-toggle');
        if (menuToggle) {
            await menuToggle.click();
            await delay(500);
            await screenshot(page, '21_mobile_menu_aberto', 'Menu lateral aberto em dispositivo móvel');
        }

        // Resetar para desktop
        await page.setViewport({ width: 1366, height: 900 });

        // ============================================================
        // FASE 11: LOGOUT
        // ============================================================
        console.log('📋 FASE 11: Logout');
        await page.goto(`${BASE_URL}/auth/logout`, { waitUntil: 'networkidle0' });
        await delay(500);
        await screenshot(page, '22_apos_logout', 'Redirecionamento após logout');

        // ============================================================
        // FASE 12: TESTE COM FUNCIONÁRIO (Permissão)
        // ============================================================
        console.log('📋 FASE 12: Login com Funcionário (sem permissão)');
        await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
        await page.type('#email', `mariasantos@tccdemo`);
        await page.type('#password', FUNCIONARIO_DATA.password);
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]')
        ]);
        await delay(500);
        await screenshot(page, '23_dashboard_funcionario', 'Dashboard do funcionário (sem permissões atribuídas)');

        console.log('\n🎉 Todos os testes concluídos com sucesso!');
        console.log(`📁 Screenshots salvos em: ${SCREENSHOTS_DIR}`);

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        await screenshot(page, 'ERROR_' + Date.now(), 'Erro durante o teste: ' + error.message).catch(() => {});
    } finally {
        await browser.close();
    }
}

main().catch(console.error);
