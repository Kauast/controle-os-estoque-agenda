# Perfis e permissoes

Use estes perfis no backend e no frontend:

- `admin`
- `estoque`
- `instrutor_os`
- `tecnico`
- `vendedor`

## Regras gerais

- `admin` pode acessar todos os modulos.
- `estoque` pode gerenciar produtos, entradas, baixas, reservas, separacao e retirada de material.
- `instrutor_os` pode criar e editar OS, vincular cliente/tecnico/equipe e solicitar material.
- `tecnico` so pode acessar OS atribuidas a ele.
- `vendedor` pode consultar estoque e registrar saidas por venda.
- `tecnico` e `instrutor_os` nunca alteram estoque diretamente.
- `tecnico` pode registrar check-in, fotos, assinatura e observacoes somente da propria OS.
- Baixa de estoque so acontece quando `admin` ou `estoque` confirma retirada de material.
- Faturamento so pode ser visto por `admin`, exceto quando `users.can_view_financial = true`.
- Toda alteracao importante deve gerar registro em `audit_logs`.

## Permissoes por modulo

| Acao | admin | estoque | instrutor_os | tecnico |
| --- | --- | --- | --- | --- |
| Ver faturamento | sim | se permitido | nao | nao |
| Ver estoque | sim | sim | consulta limitada | nao |
| Cadastrar produto | sim | sim | nao | nao |
| Entrada de estoque | sim | sim | nao | nao |
| Baixa de estoque | sim | sim | nao | nao |
| Criar OS | sim | sim | sim | nao |
| Editar OS | sim | nao | sim | somente status/fotos/assinatura da propria OS |
| Cancelar OS | sim | nao | nao | nao |
| Solicitar material | sim | sim | sim | sim |
| Aprovar material | sim | sim | nao | nao |
| Separar material | sim | sim | nao | nao |
| Confirmar retirada | sim | sim | nao | nao |
| Ver relatorios | sim | estoque operacional | operacional sem faturamento | somente propria produtividade se liberado |

Perfil `vendedor`: consulta estoque e registra saida com motivo `venda`, sem acesso a faturamento administrativo.

## Protecao de rotas sugerida

```text
GET /admin/financeiro -> admin ou can_view_financial
GET /estoque -> admin, estoque, instrutor_os, vendedor
POST /produtos -> admin, estoque
POST /estoque/entrada -> admin, estoque
POST /estoque/saida -> admin, estoque, vendedor
POST /os -> admin, estoque, instrutor_os
PATCH /os/:id -> admin, instrutor_os, tecnico da OS com campos limitados
POST /os/:id/checkin -> tecnico da OS, admin, instrutor_os
POST /os/:id/fotos -> tecnico da OS, admin, instrutor_os
POST /os/:id/assinatura -> tecnico da OS, admin, instrutor_os
POST /os/:id/observacoes -> tecnico da OS, admin, instrutor_os
DELETE /os/:id -> admin
POST /os/:id/material -> admin, estoque, instrutor_os, tecnico da OS
PATCH /material/:id/aprovar -> admin, estoque
PATCH /material/:id/separar -> admin, estoque
PATCH /material/:id/retirar -> admin, estoque
GET /relatorios/faturamento -> admin ou can_view_financial
GET /relatorios/operacional -> admin, estoque, instrutor_os
```

## Regra critica de estoque

O fluxo correto e:

1. Tecnico ou instrutor cria `material_requests` com status `pendente`.
2. Admin ou estoque aprova: status `aprovada`.
3. Banco reserva automaticamente em `products.quantity_reserved`.
4. Admin ou estoque separa: status `separada`.
5. Admin ou estoque confirma retirada: status `retirada`.
6. Banco baixa automaticamente `products.quantity_total` e remove da reserva.

O backend nao deve permitir updates diretos em `products.quantity_total` para tecnico ou instrutor.
