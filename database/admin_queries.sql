-- Financeiro mensal. A aplicacao deve permitir apenas para admin.
SELECT
  month,
  material_sold_value,
  scheduled_service_value,
  expected_revenue,
  material_cost_value,
  estimated_profit
FROM monthly_financial_summary
WHERE company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY month DESC;

-- Valor total do estoque.
SELECT
  company_id,
  SUM(stock_value) AS total_stock_value
FROM product_stock
WHERE company_id = '00000000-0000-0000-0000-000000000001'
GROUP BY company_id;

-- Produtos com estoque baixo, reservado e disponivel.
SELECT
  sku,
  name,
  quantity_total,
  quantity_reserved,
  quantity_available,
  min_quantity,
  stock_value
FROM product_stock
WHERE company_id = '00000000-0000-0000-0000-000000000001'
  AND quantity_available <= min_quantity
ORDER BY quantity_available ASC;

-- OS atribuidas a um tecnico. Use o technician_id autenticado no backend.
SELECT
  so.os_number,
  c.name AS client_name,
  so.service_address,
  so.description,
  so.status,
  so.priority,
  so.opened_at,
  so.due_at
FROM service_orders so
JOIN clients c ON c.id = so.client_id
WHERE so.technician_id = '70000000-0000-0000-0000-000000000001'
  AND so.status <> 'cancelada'
ORDER BY so.due_at NULLS LAST, so.opened_at DESC;

-- Solicitacoes de material para aprovacao do estoque/admin.
SELECT
  mr.id,
  so.os_number,
  p.name AS product_name,
  mr.quantity,
  mr.justification,
  mr.status,
  requester.name AS requested_by,
  mr.requested_at
FROM material_requests mr
JOIN service_orders so ON so.id = mr.service_order_id
JOIN products p ON p.id = mr.product_id
JOIN users requester ON requester.id = mr.requested_by
WHERE mr.status IN ('pendente', 'aprovada', 'separada')
ORDER BY mr.requested_at;

-- Historico de movimentacoes de estoque.
SELECT
  sm.created_at,
  p.sku,
  p.name AS product_name,
  sm.movement_type,
  sm.quantity,
  u.name AS user_name,
  so.os_number,
  sm.notes
FROM stock_movements sm
JOIN products p ON p.id = sm.product_id
LEFT JOIN users u ON u.id = sm.user_id
LEFT JOIN service_orders so ON so.id = sm.service_order_id
WHERE p.company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY sm.created_at DESC;

-- Agenda das 5 equipes.
SELECT
  t.name AS team_name,
  so.os_number,
  c.name AS client_name,
  tech.name AS technician_name,
  so.description,
  so.status,
  so.due_at,
  so.service_value
FROM teams t
LEFT JOIN service_orders so ON so.team_id = t.id
LEFT JOIN clients c ON c.id = so.client_id
LEFT JOIN technicians tech ON tech.id = so.technician_id
WHERE t.company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY t.name, so.due_at;

-- Status consolidado de cada equipe.
SELECT
  team_name,
  notes,
  team_status,
  member_count,
  active_orders,
  available_technicians,
  on_route_technicians,
  in_service_technicians,
  redirected_technicians
FROM team_status_summary
WHERE company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY team_name;

-- Tecnicos, equipe atual e status.
SELECT
  tech.name AS technician_name,
  tech.email,
  t.name AS current_team,
  ts.status,
  ts.last_location,
  so.os_number AS current_os,
  ts.updated_at
FROM technician_status ts
JOIN technicians tech ON tech.id = ts.technician_id
LEFT JOIN teams t ON t.id = ts.current_team_id
LEFT JOIN service_orders so ON so.id = ts.current_service_order_id
WHERE tech.company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY t.name, tech.name;

-- Historico de redirecionamento de tecnicos.
SELECT
  tr.created_at,
  tech.name AS technician_name,
  from_team.name AS from_team,
  to_team.name AS to_team,
  so.os_number,
  tr.reason,
  admin.name AS redirected_by
FROM technician_redirects tr
JOIN technicians tech ON tech.id = tr.technician_id
LEFT JOIN teams from_team ON from_team.id = tr.from_team_id
JOIN teams to_team ON to_team.id = tr.to_team_id
LEFT JOIN service_orders so ON so.id = tr.service_order_id
LEFT JOIN users admin ON admin.id = tr.redirected_by
ORDER BY tr.created_at DESC;

-- Relatorio de produtividade por equipe.
SELECT
  team_name,
  completed_orders,
  active_orders,
  average_hours,
  withdrawn_material_requests,
  orders_with_signature,
  photos_uploaded
FROM team_performance_report
WHERE company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY team_name;

-- Relatorio de quem instrui/distribui OS.
SELECT
  instructor_name,
  instructions_created,
  redirects_created,
  pending_items,
  last_instruction_at
FROM instruction_report
WHERE company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY instructions_created DESC, instructor_name;

-- Historico completo do cliente com fotos e assinatura por OS.
SELECT
  client_name,
  os_number,
  description,
  status,
  team_name,
  technician_name,
  opened_at,
  completed_at,
  photo_count,
  photos,
  signature
FROM client_service_history
WHERE company_id = '00000000-0000-0000-0000-000000000001'
  AND client_name = 'Alpha Condominio'
ORDER BY COALESCE(completed_at, opened_at) DESC;

-- Logs de auditoria.
SELECT
  al.created_at,
  u.name AS user_name,
  al.entity_type,
  al.entity_id,
  al.action,
  al.old_data,
  al.new_data
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY al.created_at DESC;
