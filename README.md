# Controle OS, Estoque e Agenda

Sistema para controle de ordens de servico, estoque, agenda mensal por equipe, solicitacao de material, fotos, assinatura do cliente, historico do cliente, relatorios e faturamento administrativo.

## O que ja existe neste prototipo

- Interface desktop administrativa.
- Interface mobile para tecnico de campo.
- API Node/Express inicial com login, JWT e permissoes por perfil.
- Agenda por 5 equipes com arrastar OS.
- Fluxo de conclusao da OS com 3 fotos e assinatura.
- Verificacao obrigatoria do ID do chip do rastreador antes de finalizar OS.
- Historico do cliente com fotos e assinatura por OS.
- Painel financeiro somente para administrador.
- Relatorios por equipe e por instrutor de OS.
- Perfis de usuario e matriz de permissoes documentada.
- Schema PostgreSQL completo.
- Docker Compose para hospedar o banco.

## Estrutura

```text
index.html
styles.css
app.js
logo.jpg
database/
  01_schema.sql
  02_seed.sql
  admin_queries.sql
server/
  package.json
  src/
    index.js
    auth.js
    db.js
  docker-compose.yml
  .env.example
  DEPLOY.md
  AUTHORIZATION.md
```

## Como abrir o prototipo

Abra `index.html` no navegador.

## Como subir banco e API

Veja o passo a passo em:

```text
server/DEPLOY.md
```

Resumo local:

```bash
cd server
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

A API sobe por padrao em:

```text
http://localhost:3001
```

Observacao: os usuarios de exemplo do seed ainda usam `password_hash` placeholder. Gere um hash real com:

```bash
npm run password:hash -- sua-senha
```

Depois atualize o `password_hash` do usuario no banco.

## Perfis de usuario

- `admin`: acesso total, faturamento, estoque, OS, relatorios e aprovacoes.
- `estoque`: produtos, entradas, baixas, reservas, separacao e retirada de material.
- `instrutor_os`: cria/edita OS, vincula cliente/tecnico e solicita material.
- `tecnico`: ve somente suas OS, atualiza status, envia fotos, assinatura e solicita material.

## Regra critica do estoque

Tecnicos e instrutores de OS nunca alteram estoque diretamente.

O fluxo correto e:

1. Tecnico ou instrutor solicita material para uma OS.
2. Admin ou responsavel pelo estoque aprova ou nega.
3. Ao aprovar, o sistema reserva a quantidade.
4. Ao confirmar retirada, o sistema baixa do estoque total e remove da reserva.
5. Toda movimentacao fica registrada no historico.

## Regra critica de fechamento da OS

Uma OS so pode ser finalizada quando tiver:

1. pelo menos 3 fotos;
2. assinatura do cliente;
3. ID do chip do rastreador contabilizado.

## O que falta para producao

Veja:

```text
PROJECT_READY_CHECKLIST.md
```
