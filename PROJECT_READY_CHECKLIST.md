# O que falta para o projeto ficar pronto e usavel

## 1. Backend real

Base inicial criada em `server/src`.

Rotas ja iniciadas:

- `POST /login`
- `POST /usuarios`
- `GET /produtos`
- `POST /produtos`
- `GET /clientes`
- `POST /clientes`
- `GET /os`
- `POST /os`
- `PATCH /os/:id`
- `POST /os/:id/material`
- `PATCH /material/:id/aprovar`
- `PATCH /material/:id/negar`
- `PATCH /material/:id/separar`
- `PATCH /material/:id/retirar`
- `GET /estoque`
- `GET /estoque/baixos`
- `GET /estoque/historico`
- `POST /estoque/entrada`
- `POST /estoque/saida`
- `GET /relatorios/operacional`
- `GET /financeiro`

Rotas ainda pendentes:

- `POST /os/:id/fotos`
- `POST /os/:id/assinatura`
- cadastro/edicao completa de produtos;
- historico do cliente por API;
- exportacoes CSV/PDF.

## 2. Autenticacao e autorizacao

Implementar:

- login com senha criptografada; iniciado
- sessao/JWT; iniciado
- middleware por perfil; iniciado
- protecao de rotas no frontend;
- regra de tecnico ver somente OS atribuidas a ele;
- regra de faturamento somente para admin.

Documento base:

```text
server/AUTHORIZATION.md
```

## 3. Upload e armazenamento de arquivos

Fotos e assinatura precisam ser salvas em storage.

Opcoes:

- pasta segura no servidor;
- S3;
- MinIO;
- Supabase Storage;
- Cloudflare R2.

O banco ja esta pronto para salvar:

- `file_url`;
- `storage_key`;
- `file_name`;
- `mime_type`;
- `file_size_bytes`.

## 4. Frontend conectado ao backend

O prototipo atual usa dados simulados.

Precisa conectar:

- dashboard admin;
- dashboard estoque;
- dashboard instrutor;
- dashboard tecnico;
- agenda das equipes;
- OS;
- estoque;
- solicitacoes de material;
- historico do cliente;
- relatorios;
- financeiro.

## 5. Modulo de estoque completo

Base visual criada para:

- cadastro de produtos;
- entrada de estoque;
- saida de estoque;
- scanner/consulta por SKU ou QR Code;
- etiqueta QR Code para impressao;
- historico com estoque antes e depois;
- alerta de estoque minimo.

Ainda pendente para producao:

- leitura real da camera do celular;
- QR Code com biblioteca de codificacao real;
- persistencia conectada ao backend;
- permissao visual por perfil no frontend;
- solicitacoes pendentes;
- aprovar/negar;
- separar;
- confirmar retirada;

## 6. Modulo de OS completo

Criar telas reais para:

- lista de OS;
- criar OS;
- editar OS;
- detalhes da OS;
- atribuir tecnico/equipe;
- alterar status;
- anexar fotos;
- coletar assinatura;
- solicitar material;
- cancelar OS.

## 7. Financeiro administrativo

Apenas admin deve acessar.

Implementar:

- total faturado por periodo;
- OS pagas;
- OS pendentes;
- faturamento por tecnico;
- custo das pecas usadas;
- lucro estimado;
- relatorio mensal;
- exportacao CSV/PDF.

## 8. Auditoria

Registrar em `audit_logs`:

- criacao/edicao/cancelamento de OS;
- alteracao de status;
- solicitacao de material;
- aprovacao/negacao;
- separacao;
- retirada;
- entrada/ajuste de estoque;
- alteracoes de faturamento;
- upload de fotos;
- assinatura do cliente.

## 9. Hospedagem

Necessario definir:

- servidor/VPS;
- dominio;
- HTTPS;
- banco PostgreSQL;
- storage de imagens;
- backups automaticos;
- monitoramento.

## 10. Testes obrigatorios

Testar:

- tecnico nao acessa OS de outro tecnico;
- tecnico nao altera estoque;
- instrutor nao altera estoque;
- admin ve faturamento;
- estoque nao ve faturamento sem permissao;
- OS nao finaliza sem 3 fotos;
- OS nao finaliza sem assinatura;
- OS nao finaliza sem ID do chip do rastreador contabilizado;
- estoque reserva ao aprovar material;
- estoque baixa somente ao confirmar retirada;
- historico do cliente mostra fotos e assinatura.
