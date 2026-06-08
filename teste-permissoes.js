/**
 * Script Complementar: Teste de Permissões
 * Captura o fluxo de atribuição de permissões e o acesso do funcionário.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'Referencias', 'Screenshots-TCC');

const MESTRA_DATA = {
    email: 'joaopedro@tccautodocs.com',
    password: 'SenhaTCC2025!'
};

const FUNCIONARIO_DATA = {
    email: 'mariasantos@tccdemo',
    password: 'Func2025!'
};

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
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    console.log('🚀 Iniciando teste de PERMISSÕES...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: { width: 1366, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        // ============================================================
        // FASE A: Login como Mestra
        // ============================================================
        console.log('📋 FASE A: Login como Mestra');
        await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
        await page.type('#email', MESTRA_DATA.email);
        await page.type('#password', MESTRA_DATA.password);
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]')
        ]);
        await delay(500);
        console.log('   ✅ Login Mestra OK');

        // ============================================================
        // FASE B: Abrir Modal de Permissões no Dashboard
        // ============================================================
        console.log('📋 FASE B: Abrir modal "Gerenciar Acessos"');
        
        // Clicar no botão "Gerenciar Acessos" do primeiro template
        const btnPermissoes = await page.$('button[onclick*="abrirModalPermissoes"]');
        if (btnPermissoes) {
            await btnPermissoes.click();
            await delay(800);
            await screenshot(page, '24_modal_permissoes_vazio', 'Modal de gerenciamento de acessos — funcionário sem permissões');
        }

        // ============================================================
        // FASE C: Marcar permissões de Acesso E Edição para Maria Santos
        // ============================================================
        console.log('📋 FASE C: Atribuir permissões ao funcionário');
        
        // Marcar checkbox de "Acesso"
        const chkAcesso = await page.$('.chk-acesso');
        if (chkAcesso) {
            const isChecked = await page.evaluate(el => el.checked, chkAcesso);
            if (!isChecked) await chkAcesso.click();
        }
        
        // Marcar checkbox de "Editar"
        const chkEditar = await page.$('.chk-editar');
        if (chkEditar) {
            const isChecked = await page.evaluate(el => el.checked, chkEditar);
            if (!isChecked) await chkEditar.click();
        }
        
        await delay(300);
        await screenshot(page, '25_modal_permissoes_marcadas', 'Permissões de Acesso e Edição atribuídas à funcionária Maria Santos');
        
        // Clicar em "Salvar Permissões"
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[onclick*="salvarPermissoes"]')
        ]);
        await delay(500);
        await screenshot(page, '26_dashboard_apos_permissao', 'Dashboard da Mestra após salvar permissões');

        // ============================================================
        // FASE D: Logout da Mestra e Login como Funcionário
        // ============================================================
        console.log('📋 FASE D: Login como Funcionário COM permissão');
        await page.goto(`${BASE_URL}/auth/logout`, { waitUntil: 'networkidle0' });
        await delay(300);
        
        await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0' });
        await page.type('#email', FUNCIONARIO_DATA.email);
        await page.type('#password', FUNCIONARIO_DATA.password);
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]')
        ]);
        await delay(500);
        await screenshot(page, '27_dashboard_funcionario_com_permissao', 'Dashboard do funcionário COM permissão — template visível');

        // ============================================================
        // FASE E: Funcionário acessa o formulário de geração
        // ============================================================
        console.log('📋 FASE E: Funcionário gerando documento');
        
        const gerarBtn = await page.$('a.btn.btn-primary.btn-sm');
        if (gerarBtn) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                gerarBtn.click()
            ]);
            await delay(500);
            await screenshot(page, '28_formulario_funcionario', 'Formulário de geração acessado pelo funcionário com sucesso');
        }

        // ============================================================
        // FASE F: Funcionário acessa a tela de edição do template
        // ============================================================
        console.log('📋 FASE F: Funcionário editando template');
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
        await delay(300);
        
        const editarBtn = await page.$('a.btn.btn-secondary.btn-sm');
        if (editarBtn) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                editarBtn.click()
            ]);
            await delay(500);
            await screenshot(page, '29_edicao_funcionario', 'Funcionário acessando a tela de edição do template (permissão de edição ativa)');
        }

        console.log('\n🎉 Teste de permissões concluído com sucesso!');
        console.log(`📁 Screenshots salvos em: ${SCREENSHOTS_DIR}`);

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        await screenshot(page, 'ERROR_PERM_' + Date.now(), 'Erro: ' + error.message).catch(() => {});
    } finally {
        await browser.close();
    }
}

main().catch(console.error);
