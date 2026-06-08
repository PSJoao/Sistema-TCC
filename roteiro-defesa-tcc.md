============================================================
ROTEIRO DE DEFESA DO TCC
AUTOMACAO E GERACAO DINAMICA DE DOCUMENTOS
Plataforma Web: AutoDocs
============================================================

Orientacoes gerais para a apresentacao:
- Fale com seguranca, olhando para a banca
- Nao leia o slide, use os topicos como gatilho de memoria
- Cada topico abaixo tem a explicacao do que voce deve dizer
- Mantenha o tom tecnico mas acessivel
- Na sessao de Resultados (Slides 14 a 18), voce fara a DEMO AO VIVO. Alterne entre os slides (como apoio) e o navegador (para mostrar na pratica).
- Tempo estimado: 15 a 20 minutos de apresentacao


============================================================
SLIDE 1 - CAPA
============================================================

Conteudo do slide:
- Titulo do TCC
- Seu nome completo
- Nome do orientador
- Instituicao
- Ano: 2026

[Nao ha fala aqui. Apenas se apresente brevemente]


============================================================
SLIDE 2 - INTRODUCAO (Parte 1)
============================================================

Topicos do slide:

- Transformacao Digital como pilar da competitividade organizacional
- Automacao de Processos de Negocio (BPA) como area estrategica
- Automacao de documentos: substituir criacao manual por fluxos digitais
- Problema: contratos, propostas e relatorios criados manualmente
- Gargalo operacional: lentidao, erros humanos, falta de padronizacao

O que dizer em cada topico:

TRANSFORMACAO DIGITAL COMO PILAR DA COMPETITIVIDADE ORGANIZACIONAL
>> Comece explicando que estamos vivendo uma era onde a transformacao
   digital nao e mais opcional, mas sim um pilar fundamental para que
   as organizacoes se mantenham competitivas. Nao se trata apenas de
   adotar tecnologia, mas de reconfigurar modelos de negocio, operacoes
   e cultura organizacional.

AUTOMACAO DE PROCESSOS DE NEGOCIO (BPA) COMO AREA ESTRATEGICA
>> Dentro desse cenario de transformacao digital, existe a BPA, ou
   Business Process Automation. A Gartner define BPA como a automacao
   de processos complexos que vao alem da simples manipulacao de dados,
   usando tecnologias avancadas. E uma tatica dentro da estrategia
   maior de transformacao digital.

AUTOMACAO DE DOCUMENTOS: SUBSTITUIR CRIACAO MANUAL POR FLUXOS DIGITAIS
>> E dentro da BPA, um dos componentes mais impactantes e a automacao
   de documentos. O objetivo e substituir a criacao manual e repetitiva
   de documentos por fluxos de trabalho digitais e inteligentes.
   Esse e exatamente o nicho que o meu trabalho ataca.

PROBLEMA: CONTRATOS, PROPOSTAS E RELATORIOS CRIADOS MANUALMENTE
>> Na pratica, empresas ainda criam contratos, propostas comerciais,
   laudos tecnicos e relatorios de forma manual. Isso gera um gargalo
   operacional enorme: e lento, repetitivo e altamente suscetivel
   a erros humanos.

GARGALO OPERACIONAL: LENTIDAO, ERROS HUMANOS, FALTA DE PADRONIZACAO
>> Pesquisas da IDC mostram que gestores perdem o equivalente a um
   mes de trabalho por ano procurando informacoes extraviadas. Processos
   manuais de contratos sao responsaveis por 61% do retrabalho e 43%
   dos atrasos. Alem disso, a falta de padronizacao enfraquece a
   identidade visual da empresa. Este trabalho se localiza no campo
   teorico da otimizacao de processos por meio de Sistemas de Informacao.


============================================================
SLIDE 3 - INTRODUCAO (Parte 2)
============================================================

Topicos do slide:

- Riscos de seguranca e conformidade na gestao manual
- LGPD: multas de ate R$ 50 milhoes por tratamento inadequado
- Proposta: plataforma web funcional para automacao e geracao dinamica
- Stack tecnologica: Node.js, MongoDB, Handlebars.js, JWT
- Metodologia: prototipo funcional (MVP) com potencial SaaS

O que dizer em cada topico:

RISCOS DE SEGURANCA E CONFORMIDADE NA GESTAO MANUAL
>> Alem da lentidao e dos erros, a gestao manual traz riscos graves
   de seguranca. Documentos fisicos sao vulneraveis a extravio e acesso
   nao autorizado. Arquivos digitais espalhados em e-mails e planilhas
   carecem de controle centralizado.

LGPD: MULTAS DE ATE R$ 50 MILHOES POR TRATAMENTO INADEQUADO
>> No Brasil, a LGPD impoe sancoes severas para o tratamento inadequado
   de dados pessoais. A automacao, com controle de acesso e rastreabilidade,
   torna-se essencial para a estrategia de conformidade de qualquer
   organizacao.

PROPOSTA: PLATAFORMA WEB FUNCIONAL PARA AUTOMACAO E GERACAO DINAMICA
>> Diante de todos esses problemas, o objetivo deste trabalho e projetar
   e desenvolver uma plataforma web funcional, chamada AutoDocs, que
   automatize a geracao de documentos em massa com campos dinamicos,
   resolvendo esse gap silencioso de produtividade.

STACK TECNOLOGICA: NODE.JS, MONGODB, HANDLEBARS.JS, JWT
>> Para isso, utilizei Node.js no backend pela sua arquitetura nao
   bloqueante ideal para operacoes de I/O como geracao de documentos;
   MongoDB pela flexibilidade do schema para templates dinamicos;
   Handlebars.js como motor de templates pela sua simplicidade; e
   JWT para autenticacao stateless segura.

METODOLOGIA: PROTOTIPO FUNCIONAL (MVP) COM POTENCIAL SAAS
>> A metodologia adotada foi o desenvolvimento de um prototipo funcional,
   um MVP, com potencial para operar como Software as a Service.


============================================================
SLIDE 4 - OBJETIVO GERAL
============================================================

Conteudo do slide (na integra):

O objetivo geral desta pesquisa e projetar e desenvolver uma plataforma
web funcional para a automacao e geracao dinamica de documentos,
oferecendo uma solucao pratica para otimizacao de processos em
ambientes corporativos.

O que dizer:

>> Leia o objetivo pausadamente. Depois complemente: "Ou seja, o
   foco principal foi sair do campo teorico e entregar um artefato
   tecnologico real, funcional, que resolve um problema concreto de
   mercado. Nao apenas projetar, mas desenvolver de fato."


============================================================
SLIDE 5 - OBJETIVOS ESPECIFICOS
============================================================

Conteudo do slide (na integra):

Para que o objetivo geral seja alcancado, os seguintes objetivos
especificos foram tracados:

- Construir um motor de templates que utilize uma linguagem de marcacao
  simples para a insercao de dados variaveis

- Implementar uma linguagem de calculo personalizada para a execucao
  de operacoes matematicas e logicas diretamente nos documentos

- Desenvolver uma interface de usuario intuitiva que permita a pessoas
  sem conhecimento tecnico avancado criar e gerenciar seus proprios
  modelos de automacao

O que dizer em cada objetivo:

MOTOR DE TEMPLATES COM LINGUAGEM DE MARCACAO SIMPLES
>> O primeiro objetivo especifico e o coracao tecnico do sistema:
   construir um motor que use chaves duplas {{ }} para inserir
   dados variaveis nos documentos Word. A escolha das chaves duplas
   foi proposital: e simples o suficiente para qualquer pessoa entender,
   sem precisar saber programar.

LINGUAGEM DE CALCULO PERSONALIZADA
>> O segundo objetivo foi implementar calculos automaticos dentro
   dos proprios documentos. Imagine um contrato que precisa calcular
   automaticamente o valor do desconto ou o valor das parcelas.
   Usando a diretiva "calc", o usuario escreve a formula diretamente
   no Word e o sistema resolve na hora da geracao.

INTERFACE INTUITIVA PARA USUARIOS NAO-TECNICOS
>> O terceiro objetivo e fundamental: de nada adianta ter um motor
   poderoso se o usuario final nao consegue usar. A interface
   precisava ser acessivel para advogados, gestores de RH,
   administradores -- pessoas que nao sao programadoras.


============================================================
SLIDE 6 - JUSTIFICATIVA
============================================================

Topicos do slide:

- Mercado global de automacao de documentos em franca expansao
- Reducao de custos operacionais e mitigacao de erros humanos
- Digitalizacao das empresas brasileiras + vigencia da LGPD
- Demanda por processos documentais padronizados, seguros e auditaveis
- Liberar profissionais de tarefas de baixo valor
- Relevancia academica: aplicacao pratica de Engenharia de Software

O que dizer em cada topico:

MERCADO GLOBAL EM FRANCA EXPANSAO
>> Dados de consultorias como Gartner e McKinsey apontam que o mercado
   global esta crescendo fortemente. As empresas buscam ativamente 
   ferramentas que automatizem fluxos documentais.

REDUCAO DE CUSTOS E MITIGACAO DE ERROS
>> A justificativa central e economica e operacional: reduzir custos
   com retrabalho, tempo perdido e eliminar o risco de erros humanos
   que geram prejuizos.

DIGITALIZACAO + LGPD
>> No contexto brasileiro, a vigencia da LGPD aumenta a demanda por 
   processos documentais seguros e auditaveis.

LIBERAR PROFISSIONAIS
>> A automacao libera profissionais para que possam focar em atividades
   estrategicas, aumentando a produtividade.

RELEVANCIA ACADEMICA
>> O trabalho representa a aplicacao pratica de conceitos de 
   Sistemas de Informacao, oferecendo solucao a um problema real.


============================================================
SLIDE 7 - REFERENCIAL TEORICO (Parte 1)
============================================================

Topicos do slide:

- Transformacao Digital (TD)
- Automacao de Processos de Negocio (BPA)
- Hierarquia: TD (estrategia) > BPA (tatica) > Automacao (ferramenta)
- Ineficiencias da gestao manual
- 61% de retrabalho e 43% de atrasos em contratos manuais (IDC)

O que dizer:

>> A Transformacao Digital e a estrategia global de modernizacao. 
   A BPA e a tatica. O meu projeto e a ferramenta que viabiliza isso. 
   O problema que resolvo e uma vulnerabilidade estrategica: processos 
   manuais causam 61% de retrabalho.


============================================================
SLIDE 8 - REFERENCIAL TEORICO (Parte 2)
============================================================

Topicos do slide:

- Motor de Template (Template Engine): coracao da plataforma
- Padrao MVC (Model-View-Controller)
- Handlebars.js: filosofia "logic-less" com sintaxe {{ }}
- Escolha estrategica: a ferramenta mais "adequada" ao publico-alvo

O que dizer:

>> O nucleo da solucao e um Motor de Template. Ele une modelos pre-definidos 
   aos dados variaveis. Escolhi o Handlebars.js pela sua sintaxe simples e 
   filosofia "logic-less". Ele foi escolhido nao por ser o mais complexo, 
   mas por ser o ideal para o meu publico (advogados e gestores), que 
   precisam de autonomia sem depender de TI.


============================================================
SLIDE 9 - REFERENCIAL TEORICO (Parte 3)
============================================================

Topicos do slide:

- Node.js: backend reativo e I/O nao bloqueante
- MongoDB: banco NoSQL orientado a documentos, schema flexivel (BSON)
- JWT: autenticacao stateless e cookie HttpOnly

O que dizer:

>> A base da plataforma e moderna e escalavel. Node.js foi usado pelo 
   seu event loop, excelente para a geracao de documentos (que e I/O). 
   MongoDB porque os templates sao dinamicos e flexiveis, o schema relacional 
   sql seria pessimo aqui. E JWT em cookies HttpOnly para seguranca anti-XSS.


============================================================
SLIDE 10 - REFERENCIAL TEORICO (Parte 4)
============================================================

Topicos do slide:

- LGPD (Lei 13.709/2018) como mecanismo de conformidade
- Extensibilidade via APIs (DocuSign, Google Drive)
- Processamento Inteligente de Documentos (IDP)
- IA e Templates Inteligentes

O que dizer:

>> Para finalizar a teoria, a plataforma foi desenhada visando a LGPD, 
   com rastreabilidade e controle de acesso. Ela e extensivel via APIs, 
   podendo integrar com assinaturas digitais. No futuro, ela se conecta 
   com Inteligencia Artificial (IDP) para criar templates autonomamente 
   a partir de contratos lidos pela IA.


============================================================
SLIDE 11 - MATERIAL E METODOS (Resumo)
============================================================

Topicos do slide:

- Pesquisa aplicada e qualitativa
- Procedimento: desenvolvimento experimental (prototipagem)
- Arquitetura: Node.js + MongoDB + Handlebars.js + JWT
- Frontend Modular: Data-Attributes e Clean Code
- Soft Delete: integridade referencial

O que dizer:

>> A metodologia baseia-se na criacao de um MVP (Produto Minimo Viavel). 
   A arquitetura segue os padroes modernos, com frontend usando Handlebars, 
   e o banco de dados usando Soft Delete (marcamos o item como deletado, 
   mas nunca apagamos fisicamente, mantendo o historico intacto para auditorias).


============================================================
------------------------------------------------------------
*** INICIO DA SECAO: RESULTADOS E DISCUSSAO (DEMO AO VIVO) ***
------------------------------------------------------------
A partir do Slide 12, voce entrara no coracao da sua apresentacao.
O texto nos slides sera MÍNIMO. Os slides serao apenas apoio visual 
com algumas imagens e palavras-chave.
Enquanto o slide estiver na tela, voce avisa: "Agora vou demonstrar 
isso na pratica". Ai voce aperta ALT+TAB, vai pro sistema rodando e mostra!
============================================================


============================================================
SLIDE 12 - RESULTADOS E DISCUSSAO: ARQUITETURA E LOGIN
============================================================

Conteudo do slide:
[Inserir IMAGEM: 01_tela_login.png]
- Autenticacao com BCrypt.js
- Isolamento de Workspace (Multi-tenant)
- Sessao segura via JWT

O que dizer (e fazer):
>> "Os resultados focaram em validar todo o fluxo desenvolvido. 
   O primeiro ponto e a seguranca. A tela de login valida credenciais
   criptografadas com BCrypt e usa JWT. Tambem temos o conceito de Workspace
   (multi-tenant), que isola os dados de diferentes empresas.
   Vou mostrar isso no prototipo agora."

[ DEMO AO VIVO - PASSO 1 ]:
1. Va para o sistema aberto no navegador.
2. Faca o login com a conta Mestra.
3. Mostre o dashboard vazio ("Empty state").


============================================================
SLIDE 13 - RESULTADOS E DISCUSSAO: MOTOR DE TEMPLATES
============================================================

Conteudo do slide:
[Inserir IMAGEM: 09_tela_editar_template.png]
- Upload simultaneo em memoria (Multer)
- Extracao inteligente via Regex
- Manutencao de 100% da formatacao original do Word

O que dizer (e fazer):
>> "No sistema, o processamento de templates comeca com o upload.
   Usamos o Mammoth para extrair o texto, Regex para encontrar as chaves {{ }} 
   e o mais importante: guardamos o binario original do Word no banco de dados
   para nao perder NENHUMA formatacao (tabelas, fontes, margens)."

[ DEMO AO VIVO - PASSO 2 ]:
1. No sistema, clique em "Novo Template".
2. Faca upload dos 2 arquivos de teste (Contrato e Termo).
3. Mostre a tela de extracao. Aponte para a tela e diga: "Aqui ele extraiu 
   as variaveis sozinho e nos deixa editar os Labels para o usuario final."
4. Salve e mostre o card do Template criado no Dashboard.


============================================================
SLIDE 14 - RESULTADOS E DISCUSSAO: GERACAO DE DOCUMENTOS
============================================================

Conteudo do slide:
[Inserir IMAGEM: 12_formulario_geracao.png]
- Super Formulario Unificado (Elimina redundancia)
- Motor de Calculo Dinamico "calc"
- PizZip + Docxtemplater com Proxy de Engenharia

O que dizer (e fazer):
>> "A grande inovacao pratica do TCC e o Super Formulario Unificado e o 
   nosso motor de calculo interno (calc). Quando vamos gerar multiplos 
   documentos, o sistema une variaveis iguais e calcula formulas matematicas
   escondidas no Word na hora."

[ DEMO AO VIVO - PASSO 3 ]:
1. Clique em "Gerar" no template.
2. Mostre o Super Formulario: "Reparem que a variavel Empresa aparece uma 
   vez so, preenchendo todos os documentos."
3. Preencha dados ficticios rapidamente (ou tenha valores padrao).
4. Clique em Gerar e baixe o ZIP. Se possivel, abra um dos arquivos gerados
   para mostrar a formatacao perfeita e os calculos realizados.


============================================================
SLIDE 15 - RESULTADOS E DISCUSSAO: CONTROLE DE ACESSO (RBAC)
============================================================

Conteudo do slide:
[Inserir IMAGENS: 16_gestao_usuarios_com_func.png / 25_modal_permissoes_marcadas.png]
- Hierarquia: Mestra, Admin, Funcionario
- Isolamento de permissoes granular
- Protecao de rotas no Frontend e Backend

O que dizer (e fazer):
>> "Por fim, o TCC validou o RBAC, controle de acessos em tres niveis. 
   Um funcionario nunca ve dados sem permissao. E as restricoes funcionam 
   tanto visualmente no Handlebars quanto na seguranca do Backend Node.js."

[ DEMO AO VIVO - PASSO 4 ]:
1. Va em "Gestao de Usuarios" e mostre a lista (fale do Alias de login).
2. Va ao Dashboard, clique em "Gerenciar Acessos" no card do template.
3. Marque "Acesso" para a conta do funcionario.
4. Deslogue da conta Mestra e Logue como o Funcionario.
5. Mostre o dashboard: agora o template esta la, mas ele nao tem botao 
   "Excluir" nem outras abas no menu superior.


============================================================
SLIDE 16 - RESULTADOS E DISCUSSAO: UX E RESPONSIVIDADE
============================================================

Conteudo do slide:
[Inserir IMAGENS: 20_mobile_dashboard.png e 17_tutorial.png]
- App-like experience (Mobile)
- Soft Delete em acao
- Tutorial integrado (acessibilidade)

O que dizer (e fazer):
>> "Alem de gerar documentos, a plataforma foi desenvolvida com foco em UX. 
   O sistema e 100% responsivo para celulares e possui um manual de instrucoes 
   completo para que qualquer leigo entenda como escrever as expressoes matematicas."

[ DEMO AO VIVO - PASSO 5 ]:
1. Com o sistema aberto, aperte F12 no Chrome e ative o modo Mobile (Celular).
2. Mostre que o layout nao quebra, clique no menu sanduiche.
3. Volte para tela normal e clique na aba "Tutorial" e mostre o manual integrado.


============================================================
SLIDE 17 - ALINHAMENTO COM OBJETIVOS
============================================================

Topicos do slide:

[Colocar uma tabela simples]
- Geracao em massa e formulario unificado >> OK
- Preservar formatacao Word >> OK
- Motor de calculo >> OK
- Controle hierarquico e Soft Delete >> OK
- Responsivo e Tutorial >> OK

O que dizer:
>> "Fechando os Resultados, este slide e o checklist de validacao. 
   Como demonstrado ao vivo e evidenciado no TCC, 100% dos objetivos foram 
   alcancados. A combinacao Node.js + MongoDB + Handlebars se mostrou perfeita 
   para este problema de automacao documental escalavel e segura."


============================================================
SLIDE 18 - CONCLUSOES
============================================================

Conteudo do slide (na integra):

A pesquisa cumpriu com exito o objetivo de propor e desenvolver uma
plataforma web funcional para automacao e geracao dinamica de documentos
em massa. A selecao das tecnologias -- Node.js no backend, MongoDB na
persistencia dinamica e Handlebars.js no motor de templates -- provou-se
altamente eficaz, permitindo a construcao de uma solucao escalavel,
segura e intuitiva.

A arquitetura robusta baseada em exclusao logica (Soft Delete) e niveis
granularizados de acesso por workspace garantiu a integridade historica
dos dados e a conformidade com as diretrizes da LGPD, tratando
informacoes sensiveis com seguranca e auditoria transparente.

Alem disso, o refinamento da interface resultou em um prototipo fluido
e totalmente responsivo, provando que e viavel democratizar a automacao
de processos para usuarios sem conhecimentos tecnicos aprofundados.

O projeto encerra-se validando a hipotese inicial e entregando uma
ferramenta pronta para ser implementada em cenarios reais de otimizacao
operacional.

O que dizer:

>> Leia com calma. Depois complemente: "Saimos do campo teorico e 
   entregamos um prototipo vivo, que resolve uma dor real de ineficiencia. 
   O trabalho prova que e possivel democratizar a automacao para pessoas 
   sem conhecimentos tecnicos."


============================================================
SLIDE 19 - TRABALHOS FUTUROS
============================================================

Topicos do slide:

- Integracao com LLMs (Inteligencia Artificial) para extrair dados sozinho
- Editor WYSIWYG integrado na plataforma
- Modulo de Assinatura Digital integrado via APIs (ex: ICP-Brasil)

O que dizer:

>> "Como passos futuros, sugerimos a adocao de Inteligencia Artificial para 
   ler PDFs antigos e mapear as variaveis sozinho (IDP). Tambem, a inclusao 
   de um editor proprio na web, e por fim o modulo de assinaturas digitais, 
   fechando o clico de vida do contrato sem sair do sistema."


============================================================
SLIDE 20 - REFERENCIAS
============================================================

Topicos do slide:
[Liste os nomes chaves, como estava no roteiro]
- GARTNER, MCKINSEY, LGPD, MONGODB, NODE.JS...

[Nao ha fala, apenas deixe na tela]


============================================================
SLIDE 21 - ENCERRAMENTO
============================================================

Obrigado!

============================================================



============================================================
============================================================
ANEXO: PERGUNTAS POSSIVEIS DA BANCA E COMO RESPONDER
============================================================
============================================================

PERGUNTA: Por que Node.js e nao Python/Django ou PHP/Laravel?
>> Node.js foi escolhido pela sua arquitetura nao bloqueante,
   ideal para operacoes de I/O intensivas como geracao de documentos.
   Alem disso, usar JavaScript no backend e no frontend (Handlebars)
   unifica a stack, facilitando a manutencao. O event loop permite
   lidar com muitas requisicoes concorrentes com poucos recursos.

PERGUNTA: Por que MongoDB e nao PostgreSQL ou MySQL?
>> Cada template tem um conjunto unico e imprevisivel de campos.
   No SQL, isso exigiria tabelas com muitas colunas nulas ou o
   padrao EAV (Entity-Attribute-Value), que e complexo e lento.
   O MongoDB permite schema flexivel onde cada documento pode ter
   estrutura diferente, mapeando naturalmente a dinamicidade dos
   templates.

PERGUNTA: Como voce garante a seguranca dos dados?
>> Tres camadas: 1) Autenticacao via JWT com cookie HttpOnly
   (protege contra XSS) e expiracao de 24h; 2) Senhas nunca
   armazenadas em texto plano, sempre hash via BCrypt.js com salt
   de 10 rounds; 3) RBAC em tres niveis com middleware authorizeRoles
   que bloqueia requisicoes no backend, nao apenas no frontend.

PERGUNTA: O que e o Proxy de Engenharia Avancada?
>> E um JavaScript Proxy que intercepta todas as leituras do
   Docxtemplater quando ele tenta resolver as tags do Word.
   O Proxy faz duas coisas: 1) Resolve variaveis de forma
   case-insensitive ({{EMPRESA}} = {{empresa}}); 2) Detecta
   tags que comecam com "calc" e executa a expressao matematica,
   substituindo as variaveis pelos valores do formulario.

PERGUNTA: Como funciona a preservacao da formatacao do Word?
>> O sistema NUNCA converte o Word para HTML ou texto. O arquivo
   .docx original e armazenado como Buffer binario no MongoDB.
   Na geracao, o PizZip descompacta o .docx (que internamente e
   um ZIP com arquivos XML), o Docxtemplater manipula apenas o XML
   interno substituindo as tags, e gera um novo .docx com a mesma
   estrutura. Fontes, tabelas, estilos e margens permanecem intactos.

PERGUNTA: O que e multi-tenant e como voce implementou?
>> Multi-tenant e o padrao onde uma unica aplicacao serve multiplas
   empresas (tenants) com isolamento de dados. Implementei via
   campo id_mestra: cada usuario subordinado tem uma referencia
   para a Mestra do workspace. Todas as consultas filtram por
   id_mestra, garantindo que dados de uma empresa nunca aparecem
   para outra.

PERGUNTA: Como funciona o Soft Delete na pratica?
>> Em vez de DELETE no banco, marco deletado: true. Em TODAS as
   consultas MongoDB, adiciono o filtro deletado: { $ne: true }.
   Assim, o registro desaparece das listagens mas continua no banco.
   Documentos gerados no passado mantem referencia ao usuario e
   template originais, preservando o historico e a auditoria.
   O login tambem rejeita usuarios com deletado: true.

PERGUNTA: Qual a diferenca do seu sistema para ferramentas como Mail Merge?
>> O Mail Merge do Word e limitado: funciona apenas com um documento
   por vez, exige uma fonte de dados externa (planilha), nao tem
   controle de acesso, nao preserva historico de geracao e nao
   oferece calculos automaticos. O AutoDocs e uma plataforma web
   completa, com multi-tenancy, RBAC, lotes de documentos com
   formulario unificado, motor de calculo, auditoria e responsividade.

PERGUNTA: Como o sistema lida com a LGPD?
>> O sistema contribui para conformidade com a LGPD de tres formas:
   1) Controle de acesso granular -- so usuarios autorizados acessam
   dados sensiveis; 2) Auditoria -- cada documento gerado registra
   quem gerou, quando e com quais dados; 3) Soft Delete -- dados
   nunca sao destruidos acidentalmente, preservando a capacidade
   de responder a solicitacoes de auditoria. Alem disso, a
   padronizacao garante que clausulas de consentimento estejam
   sempre atualizadas em todos os contratos.
