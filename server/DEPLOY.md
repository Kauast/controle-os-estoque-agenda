# Deploy do banco Controle OS

Este pacote sobe um banco PostgreSQL com as tabelas reais do projeto:

- usuarios e permissoes;
- perfis `admin`, `estoque`, `instrutor_os` e `tecnico`;
- clientes;
- 5 equipes e tecnicos;
- status atual das equipes;
- redirecionamento de tecnicos entre equipes;
- OS e agenda por equipe;
- produtos e estoque;
- materiais vendidos por OS;
- fotos obrigatorias;
- assinatura do cliente;
- historico do cliente com fotos e assinatura de cada OS;
- financeiro administrativo.
- relatorios por equipe e por instrutor de OS.

As regras de permissao estao descritas em `AUTHORIZATION.md`.

## 1. Preparar o servidor

Requisitos no servidor:

- Docker;
- Docker Compose;
- porta `5432` liberada apenas para a aplicacao ou rede interna.

## 2. Enviar os arquivos

Copie a pasta `outputs` para o servidor. Exemplo:

```bash
scp -r outputs usuario@SEU_SERVIDOR:/opt/controle-os
```

## 3. Configurar credenciais

No servidor:

```bash
cd /opt/controle-os/server
cp .env.example .env
nano .env
```

Troque principalmente:

```env
POSTGRES_PASSWORD=troque-por-uma-senha-forte
```

## 4. Subir o banco

```bash
docker compose up -d
```

O PostgreSQL vai executar automaticamente:

- `../database/01_schema.sql`;
- `../database/02_seed.sql`.

## 5. Testar conexao

```bash
docker exec -it controle-os-postgres psql -U controle_os_admin -d controle_os
```

Dentro do `psql`, rode:

```sql
SELECT * FROM monthly_financial_summary;
SELECT SUM(stock_value) FROM product_stock;
```

## 6. Atualizar banco em producao

Depois que o banco tiver dados reais, nao apague o volume Docker. Para novas mudancas, use arquivos de migracao versionados.

Volume usado:

```text
controle_os_postgres_data
```

## 7. Armazenamento de fotos e assinaturas

O banco guarda os links e metadados dos arquivos nas tabelas:

- `service_order_photos`;
- `service_order_signatures`.

Os arquivos em si devem ficar em um storage do servidor, S3, MinIO, Supabase Storage ou outro servico de arquivos. O caminho recomendado e:

```text
clients/NOME-DO-CLIENTE/CODIGO-DA-OS/foto-antes.jpg
clients/NOME-DO-CLIENTE/CODIGO-DA-OS/foto-durante.jpg
clients/NOME-DO-CLIENTE/CODIGO-DA-OS/foto-depois.jpg
clients/NOME-DO-CLIENTE/CODIGO-DA-OS/assinatura.png
```

Assim o historico do cliente consegue listar todas as OS com fotos e assinatura sem deixar o banco pesado.

## Observacao importante

A senha de exemplo nao deve ser usada em producao. O acesso financeiro deve ser liberado apenas para usuarios com `role = 'admin'` na aplicacao/backend.
