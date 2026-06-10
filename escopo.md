# **Proposta de Projeto Técnico**

## **Plataforma EAD com Painel Administrativo**

Setor de Desenvolvimento

**PROPOSTA DE PROJETO TÉCNICO**

*Sistema de Vendas de Cursos EAD com CMS Integrado*

31 de maio de 2026

### **1\. Visão Geral do Projeto**

O presente projeto visa a criação de uma plataforma digital completa para comercialização de cursos na modalidade EAD, voltada para o **Paulo Pop**, profissional especializado em **EJA** e **Compliance**. A solução contempla tanto o **site público** de vendas quanto um **painel administrativo (CMS)** que permitirá ao cliente gerenciar todo o conteúdo de forma autônoma, sem dependência de equipe técnica para alterações rotineiras.

O sistema será construído com foco em **alta conversão** (design clean e premium, mobile first) e **escalabilidade**, utilizando tecnologias modernas e boas práticas de SEO e performance. O escopo inclui a modelagem de dados específica para os cursos já definidos pelo cliente: **Curso EJA, inforcursos, cursos livres, técnicos, graduação, tecnólogo, superiores**, e **Pós-Graduação**.

### **2\. Arquitetura do Sistema**

A arquitetura segue o padrão **monolítico modular** com separação clara entre frontend e backend, ambos sob o mesmo domínio, mas com rotas distintas para administração e público. A comunicação entre frontend e backend ocorre via **API RESTful**.

| Camada | Responsabilidade | Tecnologia Sugerida |
| ----- | ----- | ----- |
| **Frontend Público** | Landing pages, páginas de curso, checkout, integração WhatsApp | Next.js \+ Tailwind CSS |
| **Painel Administrativo (CMS)** | Gestão de cursos, conteúdo, preços, professores, cupons | React \+ Next.js (dashboard embutido) |
| **Backend / API** | CRUD de entidades, autenticação JWT, processamento de pagamentos | Node.js (Express) ou Python (FastAPI) |
| **Banco de Dados** | Persistência relacional de cursos, usuários, pedidos, professores | PostgreSQL |
| **Armazenamento** | Upload de imagens, vídeos, materiais complementares | AWS S3 (ou Cloudflare R2) |

**Nota:** O frontend e o CMS compartilharão o mesmo bundle Next.js, mas com rotas protegidas (/admin) para acesso restrito ao dono do sistema.

### **3\. Requisitos do Painel Administrativo (CMS)**

O CMS deve oferecer uma interface intuitiva, responsiva e segura, permitindo ao Paulo Pop gerenciar todos os aspectos do negócio. Abaixo estão os módulos obrigatórios:

3.1 Gestão de Cursos

CRUD completo para criação, edição e exclusão de cursos. Cada curso possui campos próprios e pode ser ativado/desativado (visível ou oculto no site público).

| Campo | Tipo | Descrição |
| ----- | ----- | ----- |
| **Título** | Texto curto | Nome do curso (ex: “Curso EJA – Educação de Jovens e Adultos”) |
| **Subtítulo** | Texto curto | Frase de impacto (ex: “Conclua em 4 meses com certificado reconhecido”) |
| **Descrição** | Rich text (WYSIWYG) | Conteúdo principal da página do curso |
| **Imagem de Capa** | Upload (imagem) | Banner principal da landing page |
| **Carga Horária** | Número (horas) | Ex: 560h para a Pós Compliance |
| **Modalidade** | Seleção única | EAD / Semi-presencial / Presencial |
| **Duração Estimada** | Texto curto | Ex: 4 meses, 12 meses |

3.2 Gestão de Conteúdo (Banners e Textos)

Permite editar todos os textos e imagens das landing pages sem a necessidade de código. O CMS deve expor um editor de bloco visual (seções de Hero, Diferenciais, Depoimentos, etc.).

* **Seções editáveis**: Hero (headline, background image), Barra de benefícios, Cards de módulos, Chamada para ação (CTA).

* **Imagens**: Upload e substituição de banners, logos de parceiros, selos de confiança.

3.3 Grade Curricular

O administrador deve poder criar, reorganizar e editar facilmente os módulos e disciplinas de cada curso, com suporte a arrastar e soltar (*drag & drop*).

| Campo | Tipo | Descrição |
| ----- | ----- | ----- |
| **Módulo** | Texto | Nome do bloco (ex: “Módulo 1 – Fundamentos da EJA”) |
| **Disciplinas** | Lista ordenada | Nome de cada aula/tópico dentro do módulo |
| **Carga Horária por Módulo** | Número | Horas dedicadas a cada módulo |

3.4 Gestão de Professores

Cadastro de docentes que aparecerão nas páginas dos cursos como “corpo docente”.

* **Foto** (upload, formato quadrado)

* **Nome completo**

* **Mini bio** (até 200 caracteres)

* **Especialidades** (tags, ex: Direito Administrativo, Gestão Pública)

* **Link para LinkedIn** (opcional)

3.5 Gestão de Preços e Cupons

Configuração dos valores de venda e promoções, com controle por curso.

| Campo | Tipo | Exemplo |
| ----- | ----- | ----- |
| **Valor à Vista (PIX)** | Decimal | R$ 1.350,00 |
| **Valor Parcelado** | Decimal | R$ 1.350,00 (com até 12x) |
| **Número de Parcelas** | Inteiro | 12 |
| **Valor da Parcela** | Decimal | R$ 112,50 |
| **Cupons de Desconto** | Tabela embutida | Código, % desconto, validade, uso máximo |

**Atenção:** O CMS deve calcular automaticamente o valor da parcela com base no total e no número de parcelas, exibindo o resultado antes de salvar.

### **4\. Requisitos de Frontend (Público)**

O site público será o ponto de contato com o cliente final. Deve ser visualmente impecável, extremamente rápido e otimizado para conversão.

* **Design Clean & Premium**: tipografia limpa, espaçamento generoso, paleta de cores institucional (tons de azul e laranja, remetendo a seriedade e energia).

* **Landing Pages Dinâmicas**: todas as páginas de curso consumirão os dados do CMS via SSR (Server-Side Rendering) ou ISR (Incremental Static Regeneration), garantindo SEO e rapidez.

* **Mobile First**: responsividade total, com navegação adaptada para telas pequenas e botões de CTA de fácil toque.

* **Alta Velocidade de Carregamento**: lazy loading de imagens, otimização de fontes e uso de CDN para assets estáticos.

* **Checkout Integrado**: fluxo de compra com cálculo automático de parcelas, geração de link de pagamento (PIX) e confirmação via webhook.

* **Botão Flutuante do WhatsApp**: gatilho de atendimento personalizado, com mensagem pré-definida contendo o nome do curso.

* **Gatilhos de Escassez**: contador regressivo de oferta temporária e indicador de “vagas restantes” (configurável no CMS).

### **5\. Especificações de Dados (Baseado no Perfil do Paulo Pop)**

Com base nas informações fornecidas, modelamos os dados iniciais que devem ser inseridos no CMS na primeira implantação.

| Entidade | Campo | Valor |
| ----- | ----- | ----- |
| **Curso EJA** | Título | Curso EJA – Educação de Jovens e Adultos |
| Valor à Vista (PIX) | R$ 1.350,00 |  |
| Parcelamento | 12x de R$ 112,50 |  |
| Certificado | Emitido em até 30 dias após conclusão |  |
| **Pós Compliance** | Título | Pós-Graduação em Compliance |
| Valor | R$ 1.548,00 |  |
| Carga Horária | 560 horas |  |
| Modalidade | 100% EAD |  |

“Esses valores servirão como seed data para testes e homologação, podendo ser alterados a qualquer momento pelo administrador.”

### **6\. Stack Tecnológica Sugerida**

A stack foi escolhida para equilibrar produtividade, desempenho e facilidade de manutenção futura.

| Camada | Tecnologia | Justificativa |
| ----- | ----- | ----- |
| **Frontend** | Next.js 14 (App Router) \+ Tailwind CSS | SSR/ISR nativos, SEO amigável, ecossistema maduro e suporte a componentes React |
| **CMS (Dashboard)** | React Admin ou Strapi embutido na mesma aplicação | Customização total e baixo custo de licenciamento |
| **Backend / API** | Node.js \+ Express ou Python \+ FastAPI | Performance e familiaridade com REST; FastAPI oferece auto-documentação |
| **Banco de Dados** | PostgreSQL 16 | Relacional, suporte a JSONB para campos flexíveis |
| **Armazenamento** | AWS S3 \+ CloudFront (CDN) | Escalabilidade global e preço acessível |
| **Autenticação** | NextAuth.js \+ JWT | Integração nativa com Next.js e suporte a provedores OAuth |
| **Pagamentos** | Stripe ou Mercado Pago (API de cobrança) | Suporte a PIX e parcelamento, webhooks de confirmação |
| **Hospedagem** | Vercel (frontend) / AWS EC2 ou Railway (backend) | Deploy simplificado com Next.js no Vercel; backend em container |

### **Conclusão e Próximos Passos**

Esta proposta estabelece o escopo técnico mínimo necessário para iniciar o desenvolvimento da plataforma. Após aprovação, as etapas seguintes serão:

1. **Kickoff** – alinhamento de cronograma e acesso aos conteúdos existentes.

2. **Protótipo Interativo** – entrega de wireframe navegável das telas principais.

3. **Sprint 1 (CMS)** – implementação do painel administrativo e seed dos dados do Paulo Pop.

4. **Sprint 2 (Frontend)** – landing pages responsivas e integração com pagamentos.

5. **Homologação e Deploy** – testes, ajustes finais e publicação em ambiente de produção.

### **Sites exemplo e inspriradores**

1. [https://pos.grancursosonline.com.br/](https://pos.grancursosonline.com.br/)

2. [https://uniunica.edu.br/graduacao/ead?agencyPartner=2222](https://uniunica.edu.br/graduacao/ead?agencyPartner=2222)

3. [https://faculdadefocus.com.br/produtos?group=mba\&category=gestao](https://faculdadefocus.com.br/produtos?group=mba&category=gestao) 

**PARTE ADMINISTRATIVA O BECKENDE UTILIZAR O [WWW.ACADEMYPOP.COM.BR](http://WWW.ACADEMYPOP.COM.BR)  COMO PONTO DE PARTIDA PARA ESTRUTURAR O NOVO.**

**Tudo aqui é sugestão e aceito sugestão para o site ser o mais facilitador de fazimentos de negócios.**

**Documento elaborado em 31 de maio de 2026\.**   
