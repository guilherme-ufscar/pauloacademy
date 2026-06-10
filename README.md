# Academy Pop – Plataforma EAD

## Início Rápido

### 1. Configure o .env
```bash
cp .env.example .env
# Edite o .env e defina a EXTERNAL_PORT desejada (padrão: 80)
```

### 2. Suba todos os serviços
```bash
docker-compose up -d --build
```

### 3. Acesse
- **Site público**: http://localhost (ou a porta definida em EXTERNAL_PORT)
- **Admin**: http://localhost/admin
  - Login: `admin@paulopop.com.br`
  - Senha: `Admin@2024`

---

## Estrutura

```
paulo2/
├── docker-compose.yml      # Orquestração de todos os serviços
├── .env                    # Variáveis de ambiente (não comitar!)
├── nginx/                  # Proxy reverso
├── backend/                # API Node.js + Express
│   └── src/
│       ├── routes/         # Auth, cursos, professores, conteúdo, cupons, pedidos
│       └── db/             # Schema SQL + seed
└── frontend/               # Next.js 14 (App Router + Tailwind)
    └── src/
        ├── app/            # Páginas públicas e admin
        └── components/     # Componentes reutilizáveis
```

## Serviços Docker (todos internos, só nginx é externo)

| Serviço      | Porta interna | Descrição                     |
|-------------|--------------|-------------------------------|
| nginx        | 80 (externa) | Proxy reverso único           |
| frontend     | 3000         | Next.js                       |
| backend      | 3001         | API REST Node.js/Express      |
| postgres     | 5432         | Banco de dados                |
| minio        | 9000         | Storage de imagens (S3)       |

## Variáveis de ambiente importantes

| Variável              | Padrão               | Descrição                     |
|----------------------|---------------------|-------------------------------|
| EXTERNAL_PORT        | 80                  | Porta exposta ao mundo        |
| ADMIN_EMAIL          | admin@paulopop.com.br | E-mail do admin             |
| ADMIN_PASSWORD       | Admin@2024          | Senha do admin                |
| JWT_SECRET           | (gere um seguro)    | Chave JWT                     |
| MERCADOPAGO_ACCESS_TOKEN | (vazio)         | Token MP para pagamentos reais|

## Módulos do CMS Admin

- **Cursos**: CRUD completo com grade curricular drag & drop
- **Professores**: Cadastro com foto e especialidades
- **Conteúdo**: Edição de hero, benefícios, sobre e rodapé
- **Cupons**: Criação e gestão de cupons de desconto
- **Pedidos**: Listagem com status e receita

## Pagamentos

O sistema suporta Mercado Pago. Para ativar:
1. Adicione `MERCADOPAGO_ACCESS_TOKEN=seu_token` no `.env`
2. Configure o webhook: `POST /api/orders/webhook/mercadopago`
3. Sem o token, o checkout redireciona para WhatsApp

## Dados iniciais (seed)

Ao primeiro boot, são criados automaticamente:
- Usuário admin
- Curso EJA com grade curricular completa
- Pós-Graduação em Compliance
- Professores de exemplo
- Cupom EJA10 (10% de desconto)
- Conteúdo das seções (hero, benefícios, sobre, rodapé)
