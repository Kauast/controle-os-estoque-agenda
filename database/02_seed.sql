INSERT INTO companies (id, name, logo_url)
VALUES ('00000000-0000-0000-0000-000000000001', 'Controle OS', './logo.jpg');

INSERT INTO users (id, company_id, name, phone, email, password_hash, role, can_view_financial)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Administrador', '(11) 90000-0001', 'admin@empresa.com', 'trocar-por-hash-seguro', 'admin', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Responsavel Estoque', '(11) 90000-0002', 'estoque@empresa.com', 'trocar-por-hash-seguro', 'estoque', false),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Instrutor OS', '(11) 90000-0003', 'instrutor@empresa.com', 'trocar-por-hash-seguro', 'instrutor_os', false),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Bruno', '(11) 90000-0004', 'bruno@empresa.com', 'trocar-por-hash-seguro', 'tecnico', false),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Ana', '(11) 90000-0005', 'ana@empresa.com', 'trocar-por-hash-seguro', 'tecnico', false),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Marcos', '(11) 90000-0006', 'marcos@empresa.com', 'trocar-por-hash-seguro', 'tecnico', false),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Diego', '(11) 90000-0007', 'diego@empresa.com', 'trocar-por-hash-seguro', 'tecnico', false),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Vendedor', '(11) 90000-0008', 'vendedor@empresa.com', 'trocar-por-hash-seguro', 'vendedor', false);

INSERT INTO clients (id, company_id, name, phone, email, address, document_number, notes)
VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alpha Condominio', '(11) 4000-1000', 'contato@alpha.com', 'Rua das Flores, 120', '00.000.000/0001-00', 'Cliente com contrato mensal.'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Mercado Central', '(11) 4000-2000', 'contato@mercado.com', 'Av. Central, 410', NULL, NULL),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Clinica Santa Clara', '(11) 4000-3000', 'contato@clinica.com', 'Rua Saude, 88', NULL, NULL),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Residencial Norte', '(11) 4000-4000', 'contato@resnorte.com', 'Av. Norte, 700', NULL, NULL);

INSERT INTO technicians (id, company_id, user_id, name, phone, email, active)
VALUES
  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Bruno', '(11) 90000-0004', 'bruno@empresa.com', true),
  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Ana', '(11) 90000-0005', 'ana@empresa.com', true),
  ('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'Marcos', '(11) 90000-0006', 'marcos@empresa.com', true),
  ('70000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Diego', '(11) 90000-0007', 'diego@empresa.com', true);

INSERT INTO teams (id, company_id, name, notes)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Equipe 1', 'Bruno e Leo'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Equipe 2', 'Ana e Rui'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Equipe 3', 'Marcos e Bia'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Equipe 4', 'Diego e Caio'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Equipe 5', 'Plantao');

INSERT INTO team_members (team_id, technician_id)
VALUES
  ('20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000004');

INSERT INTO products (id, company_id, name, sku, category, location, qr_code_value, quantity_total, quantity_reserved, min_quantity, purchase_cost, sale_price, supplier, active)
VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Fonte 12V 2A', 'FON-12V-2A', 'Eletrica', 'Prateleira A1', 'PROD:FON-12V-2A', 28, 0, 20, 29.00, 48.00, 'Fornecedor A', true),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Bateria 7Ah', 'BAT-7AH', 'Energia', 'Prateleira A2', 'PROD:BAT-7AH', 20, 0, 12, 62.00, 96.00, 'Fornecedor B', true),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Cabo UTP Cat6', 'CAB-CAT6', 'Rede', 'Corredor B1', 'PROD:CAB-CAT6', 10, 0, 6, 270.00, 420.00, 'Fornecedor C', true),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Sensor magnetico', 'SEN-MAG', 'Alarme', 'Gaveta C3', 'PROD:SEN-MAG', 60, 0, 30, 18.00, 32.00, 'Fornecedor A', true),
  ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Camera dome Full HD', 'CAM-DOME-FHD', 'CFTV', 'Armario D1', 'PROD:CAM-DOME-FHD', 20, 0, 8, 128.00, 189.00, 'Fornecedor D', true),
  ('40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Controle remoto TX', 'CTRL-TX', 'Automacao', 'Gaveta C1', 'PROD:CTRL-TX', 30, 0, 15, 34.00, 58.00, 'Fornecedor E', true);

INSERT INTO service_orders (id, company_id, os_number, client_id, technician_id, team_id, created_by, service_address, description, status, priority, opened_at, due_at, service_value, payment_method, payment_status, tracker_chip_id, notes)
VALUES
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'OS-1048', '30000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Rua das Flores, 120', 'Portao automatico sem resposta. Verificar central, fonte e sensores.', 'em_andamento', 'alta', '2026-06-05 09:30:00-03', '2026-06-05 11:00:00-03', 680.00, 'pix', 'pendente', NULL, 'Cliente solicitou prioridade.'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'OS-1049', '30000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Av. Central, 410', 'Preventiva em cameras CFTV.', 'aberta', 'normal', '2026-06-05 11:00:00-03', '2026-06-05 12:30:00-03', 920.00, 'boleto', 'pendente', NULL, NULL),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'OS-1050', '30000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Rua Saude, 88', 'Troca de fonte e bateria.', 'material_solicitado', 'normal', '2026-06-05 14:00:00-03', '2026-06-05 15:30:00-03', 540.00, 'cartao', 'pendente', NULL, NULL),
  ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'OS-1051', '30000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Av. Norte, 700', 'Instalacao de leitor facial.', 'aberta', 'normal', '2026-06-05 16:30:00-03', '2026-06-05 18:00:00-03', 1450.00, 'pix', 'pendente', NULL, NULL);

INSERT INTO material_requests (id, service_order_id, requested_by, product_id, quantity, justification, status, approved_by, separated_by, withdrawn_by, requested_at, approved_at, withdrawn_at)
VALUES
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 1, 'Fonte queimada no portao.', 'retirada', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '2026-06-05 09:45:00-03', '2026-06-05 09:55:00-03', '2026-06-05 10:05:00-03'),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 1, 'Troca preventiva da bateria.', 'pendente', NULL, NULL, NULL, '2026-06-05 13:40:00-03', NULL, NULL);

INSERT INTO stock_movements (product_id, movement_type, quantity, stock_before, stock_after, reason, supplier, user_id, service_order_id, material_request_id, notes)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'saida', 1, 28, 27, 'OS', NULL, '10000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Retirada confirmada para OS-1048'),
  ('40000000-0000-0000-0000-000000000002', 'reserva', 1, 20, 20, 'OS', NULL, '10000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000002', 'Exemplo de reserva pendente de separacao');

UPDATE products
SET quantity_total = quantity_total - 1
WHERE id = '40000000-0000-0000-0000-000000000001';

UPDATE products
SET quantity_reserved = quantity_reserved + 1
WHERE id = '40000000-0000-0000-0000-000000000002';

INSERT INTO service_order_photos (service_order_id, photo_type, file_url, storage_key, file_name, mime_type, file_size_bytes, uploaded_by)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'antes', '/storage/clients/alpha-condominio/os-1048/foto-antes.jpg', 'clients/alpha-condominio/os-1048/foto-antes.jpg', 'foto-antes.jpg', 'image/jpeg', 482000, '10000000-0000-0000-0000-000000000004'),
  ('50000000-0000-0000-0000-000000000001', 'durante', '/storage/clients/alpha-condominio/os-1048/foto-durante.jpg', 'clients/alpha-condominio/os-1048/foto-durante.jpg', 'foto-durante.jpg', 'image/jpeg', 516000, '10000000-0000-0000-0000-000000000004'),
  ('50000000-0000-0000-0000-000000000001', 'depois', '/storage/clients/alpha-condominio/os-1048/foto-depois.jpg', 'clients/alpha-condominio/os-1048/foto-depois.jpg', 'foto-depois.jpg', 'image/jpeg', 498000, '10000000-0000-0000-0000-000000000004');

INSERT INTO service_order_signatures (service_order_id, client_name, signature_url, storage_key, file_name, mime_type, file_size_bytes)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'Cliente Alpha', '/storage/clients/alpha-condominio/os-1048/assinatura.png', 'clients/alpha-condominio/os-1048/assinatura.png', 'assinatura.png', 'image/png', 68000);

INSERT INTO service_order_instructions (service_order_id, instructed_by, assigned_team_id, instruction_type, notes, pending_items)
VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'distribuicao', 'Prioridade alta. Verificar central, fonte e sensores antes de liberar o cliente.', 0),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'orientacao_tecnica', 'Validar DVR e cameras sem imagem antes da preventiva geral.', 1),
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'revisao_qualidade', 'Reforcar checklist de fotos e assinatura antes da conclusao.', 1),
  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'redirecionamento', 'Apoio de plantao solicitado para instalacao no fim do dia.', 0);

INSERT INTO technician_status (technician_id, current_team_id, current_service_order_id, status, last_location)
VALUES
  ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'em_atendimento', 'Alpha Condominio'),
  ('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', 'a_caminho', 'A caminho da Clinica Santa Clara'),
  ('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', 'aguardando_checklist', 'Mercado Central'),
  ('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', 'disponivel', 'Base');

INSERT INTO technician_redirects (technician_id, from_team_id, to_team_id, service_order_id, reason, redirected_by)
VALUES
  ('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000004', 'Apoio de plantao para instalacao', '10000000-0000-0000-0000-000000000001');
