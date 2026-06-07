require("dotenv").config();

const bcrypt = require("bcryptjs");
const cors = require("cors");
const express = require("express");
const { allowFinancial, allowRoles, requireAuth, signToken } = require("./auth");
const { pool, query, transaction } = require("./db");
const { fetchDevices, fetchPositions, getTraccarConfig, normalizeDevice, normalizePosition } = require("./traccar");

const app = express();
const port = Number(process.env.API_PORT || 3001);

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "5mb" }));

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === "");

  if (missing.length > 0) {
    const error = new Error(`Campos obrigatorios ausentes: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
}

async function assertTechnicianOwnsOrder(user, serviceOrderId) {
  if (user.role !== "tecnico") return;

  const { rows } = await query(
    `SELECT 1
     FROM service_orders so
     JOIN technicians t ON t.id = so.technician_id
     WHERE so.id = $1 AND t.user_id = $2`,
    [serviceOrderId, user.id],
  );

  if (!rows[0]) {
    const error = new Error("Tecnico so pode acessar OS atribuida a ele.");
    error.status = 403;
    throw error;
  }
}

async function assertServiceOrderInCompany(user, serviceOrderId) {
  const { rows } = await query(
    "SELECT 1 FROM service_orders WHERE id = $1 AND company_id = $2",
    [serviceOrderId, user.company_id],
  );

  if (!rows[0]) {
    const error = new Error("OS nao encontrada.");
    error.status = 404;
    throw error;
  }
}

async function assertProductInCompany(user, productId) {
  const { rows } = await query(
    "SELECT 1 FROM products WHERE id = $1 AND company_id = $2",
    [productId, user.company_id],
  );

  if (!rows[0]) {
    const error = new Error("Produto nao encontrado.");
    error.status = 404;
    throw error;
  }
}

async function assertTeamInCompany(user, teamId) {
  if (!teamId) return;

  const { rows } = await query(
    "SELECT 1 FROM teams WHERE id = $1 AND company_id = $2",
    [teamId, user.company_id],
  );

  if (!rows[0]) {
    const error = new Error("Equipe nao encontrada.");
    error.status = 404;
    throw error;
  }
}

async function findProductForStock(client, user, identifier) {
  const { rows } = await client.query(
    `SELECT *
     FROM products
     WHERE company_id = $1
       AND active = true
       AND (
         id::text = $2
         OR lower(sku) = lower($2)
         OR lower(qr_code_value) = lower($2)
       )
     FOR UPDATE`,
    [user.company_id, identifier],
  );

  if (!rows[0]) {
    const error = new Error("Produto nao encontrado pelo SKU, QR Code ou ID informado.");
    error.status = 404;
    throw error;
  }

  return rows[0];
}

async function assertRecordInCompany(table, id, companyId, label) {
  if (!id) return;

  const allowedTables = new Set(["clients", "technicians", "teams"]);

  if (!allowedTables.has(table)) {
    const error = new Error("Tabela invalida para validacao.");
    error.status = 500;
    throw error;
  }

  const { rows } = await query(
    `SELECT 1 FROM ${table} WHERE id = $1 AND company_id = $2`,
    [id, companyId],
  );

  if (!rows[0]) {
    const error = new Error(`${label} nao encontrado.`);
    error.status = 404;
    throw error;
  }
}

async function writeAudit(client, user, entityType, entityId, action, newData = null) {
  await client.query(
    `INSERT INTO audit_logs (company_id, user_id, entity_type, entity_id, action, new_data)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [user.company_id, user.id, entityType, entityId, action, newData],
  );
}

async function upsertTraccarDevice(client, user, device) {
  const normalized = normalizeDevice(device);

  if (!normalized.traccar_id) {
    const error = new Error("Dispositivo Traccar sem id.");
    error.status = 400;
    throw error;
  }

  const { rows } = await client.query(
    `INSERT INTO traccar_devices (
       company_id, vehicle_id, team_id, traccar_id, unique_id, name, status,
       disabled, phone, model, contact, category, position_id, last_update,
       attributes, raw, synced_at
     )
     VALUES (
       $1,
       (SELECT id FROM vehicles WHERE company_id = $1 AND tracker_chip_id = $3 LIMIT 1),
       (SELECT team_id FROM vehicles WHERE company_id = $1 AND tracker_chip_id = $3 LIMIT 1),
       $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now()
     )
     ON CONFLICT (company_id, traccar_id)
     DO UPDATE SET
       vehicle_id = COALESCE(traccar_devices.vehicle_id, EXCLUDED.vehicle_id),
       team_id = COALESCE(traccar_devices.team_id, EXCLUDED.team_id),
       unique_id = EXCLUDED.unique_id,
       name = EXCLUDED.name,
       status = EXCLUDED.status,
       disabled = EXCLUDED.disabled,
       phone = EXCLUDED.phone,
       model = EXCLUDED.model,
       contact = EXCLUDED.contact,
       category = EXCLUDED.category,
       position_id = EXCLUDED.position_id,
       last_update = EXCLUDED.last_update,
       attributes = EXCLUDED.attributes,
       raw = EXCLUDED.raw,
       synced_at = now()
     RETURNING *`,
    [
      user.company_id,
      normalized.traccar_id,
      normalized.unique_id,
      normalized.name,
      normalized.status,
      normalized.disabled,
      normalized.phone,
      normalized.model,
      normalized.contact,
      normalized.category,
      normalized.position_id,
      normalized.last_update,
      normalized.attributes,
      normalized.raw,
    ],
  );

  return rows[0];
}

async function upsertTraccarPosition(client, user, position, deviceMap) {
  const normalized = normalizePosition(position);
  const localDevice = deviceMap.get(Number(normalized.traccar_device_id));

  if (!localDevice || normalized.latitude === undefined || normalized.longitude === undefined) {
    return null;
  }

  const { rows } = await client.query(
    `INSERT INTO traccar_positions (
       company_id, traccar_device_id, traccar_position_id, device_time, fix_time,
       server_time, valid, latitude, longitude, altitude, speed, course, address,
       accuracy, attributes, raw, received_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now())
     ON CONFLICT (company_id, traccar_position_id)
     DO UPDATE SET
       traccar_device_id = EXCLUDED.traccar_device_id,
       device_time = EXCLUDED.device_time,
       fix_time = EXCLUDED.fix_time,
       server_time = EXCLUDED.server_time,
       valid = EXCLUDED.valid,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       altitude = EXCLUDED.altitude,
       speed = EXCLUDED.speed,
       course = EXCLUDED.course,
       address = EXCLUDED.address,
       accuracy = EXCLUDED.accuracy,
       attributes = EXCLUDED.attributes,
       raw = EXCLUDED.raw,
       received_at = now()
     RETURNING *`,
    [
      user.company_id,
      localDevice.id,
      normalized.traccar_position_id,
      normalized.device_time,
      normalized.fix_time,
      normalized.server_time,
      normalized.valid,
      normalized.latitude,
      normalized.longitude,
      normalized.altitude,
      normalized.speed,
      normalized.course,
      normalized.address,
      normalized.accuracy,
      normalized.attributes,
      normalized.raw,
    ],
  );

  return rows[0];
}

async function syncTraccarSnapshot(user, params = {}) {
  const [devices, positions] = await Promise.all([
    fetchDevices({ all: params.all }),
    fetchPositions(params.position_id ? { id: params.position_id } : {}),
  ]);

  return transaction(async (client) => {
    const syncedDevices = [];
    const deviceMap = new Map();

    for (const device of devices) {
      const synced = await upsertTraccarDevice(client, user, device);
      syncedDevices.push(synced);
      deviceMap.set(Number(synced.traccar_id), synced);
    }

    const syncedPositions = [];
    for (const position of positions) {
      const synced = await upsertTraccarPosition(client, user, position, deviceMap);
      if (synced) syncedPositions.push(synced);
    }

    await writeAudit(client, user, "traccar", null, "sync", {
      devices: syncedDevices.length,
      positions: syncedPositions.length,
    });

    return {
      devices: syncedDevices,
      positions: syncedPositions,
    };
  });
}

app.get("/health", asyncRoute(async (req, res) => {
  await query("SELECT 1");
  res.json({ ok: true });
}));

app.post("/login", asyncRoute(async (req, res) => {
  requireFields(req.body, ["email", "password"]);

  const { rows } = await query(
    `SELECT id, company_id, name, email, password_hash, role, active, can_view_financial
     FROM users
     WHERE lower(email) = lower($1)`,
    [req.body.email],
  );

  const user = rows[0];
  const valid = user && user.active && await bcrypt.compare(req.body.password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: "Email ou senha invalidos." });
  }

  const { password_hash: passwordHash, ...safeUser } = user;
  res.json({ token: signToken(user), user: safeUser });
}));

app.post("/usuarios", requireAuth, allowRoles("admin"), asyncRoute(async (req, res) => {
  requireFields(req.body, ["name", "email", "password", "role"]);

  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const { rows } = await query(
    `INSERT INTO users (company_id, name, phone, email, password_hash, role, can_view_financial)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, company_id, name, phone, email, role, active, can_view_financial, created_at`,
    [
      req.user.company_id,
      req.body.name,
      req.body.phone || null,
      req.body.email,
      passwordHash,
      req.body.role,
      Boolean(req.body.can_view_financial),
    ],
  );

  res.status(201).json(rows[0]);
}));

app.get("/produtos", requireAuth, allowRoles("admin", "estoque", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const { rows } = await query(
    `SELECT *
     FROM product_stock
     WHERE company_id = $1
     ORDER BY name`,
    [req.user.company_id],
  );

  res.json(rows);
}));

app.post("/produtos", requireAuth, allowRoles("admin", "estoque"), asyncRoute(async (req, res) => {
  requireFields(req.body, ["name", "sku", "category", "quantity_total", "min_quantity", "purchase_cost"]);

  const qrCodeValue = req.body.qr_code_value || `PROD:${req.body.sku}`;
  const { rows } = await query(
    `INSERT INTO products (
       company_id, name, sku, category, location, qr_code_value,
       quantity_total, min_quantity, purchase_cost, sale_price, supplier
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, 0), $11)
     RETURNING *`,
    [
      req.user.company_id,
      req.body.name,
      req.body.sku,
      req.body.category,
      req.body.location || null,
      qrCodeValue,
      req.body.quantity_total,
      req.body.min_quantity,
      req.body.purchase_cost,
      req.body.sale_price || 0,
      req.body.supplier || null,
    ],
  );

  res.status(201).json(rows[0]);
}));

app.get("/clientes", requireAuth, asyncRoute(async (req, res) => {
  const { rows } = await query(
    `SELECT id, name, phone, email, address, document_number, notes, created_at
     FROM clients
     WHERE company_id = $1
     ORDER BY name`,
    [req.user.company_id],
  );

  res.json(rows);
}));

app.post("/clientes", requireAuth, allowRoles("admin", "estoque", "instrutor_os"), asyncRoute(async (req, res) => {
  requireFields(req.body, ["name"]);

  const { rows } = await query(
    `INSERT INTO clients (company_id, name, phone, email, address, document_number, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      req.user.company_id,
      req.body.name,
      req.body.phone || null,
      req.body.email || null,
      req.body.address || null,
      req.body.document_number || null,
      req.body.notes || null,
    ],
  );

  res.status(201).json(rows[0]);
}));

app.get("/os", requireAuth, asyncRoute(async (req, res) => {
  const params = [req.user.company_id];
  let technicianFilter = "";

  if (req.user.role === "tecnico") {
    params.push(req.user.id);
    technicianFilter = "AND tech.user_id = $2";
  }

  const { rows } = await query(
    `SELECT
       so.*,
       c.name AS client_name,
       tech.name AS technician_name,
       t.name AS team_name
     FROM service_orders so
     JOIN clients c ON c.id = so.client_id
     LEFT JOIN technicians tech ON tech.id = so.technician_id
     LEFT JOIN teams t ON t.id = so.team_id
     WHERE so.company_id = $1 ${technicianFilter}
     ORDER BY
       CASE so.priority
         WHEN 'alta' THEN 0
         WHEN 'normal' THEN 1
         WHEN 'baixa' THEN 2
         ELSE 3
       END,
       so.due_at NULLS LAST,
       so.opened_at DESC`,
    params,
  );

  res.json(rows);
}));

app.get("/os/:id", requireAuth, asyncRoute(async (req, res) => {
  await assertServiceOrderInCompany(req.user, req.params.id);
  await assertTechnicianOwnsOrder(req.user, req.params.id);

  const [order, photos, signature, notes, materials, history] = await Promise.all([
    query(
      `SELECT so.*, c.name AS client_name, c.phone AS client_phone, c.email AS client_email,
              c.address AS client_address, c.notes AS client_notes,
              tech.name AS technician_name, t.name AS team_name
       FROM service_orders so
       JOIN clients c ON c.id = so.client_id
       LEFT JOIN technicians tech ON tech.id = so.technician_id
       LEFT JOIN teams t ON t.id = so.team_id
       WHERE so.id = $1 AND so.company_id = $2`,
      [req.params.id, req.user.company_id],
    ),
    query("SELECT * FROM service_order_photos WHERE service_order_id = $1 ORDER BY uploaded_at", [req.params.id]),
    query("SELECT * FROM service_order_signatures WHERE service_order_id = $1", [req.params.id]),
    query(
      `SELECT son.*, u.name AS user_name
       FROM service_order_notes son
       LEFT JOIN users u ON u.id = son.user_id
       WHERE son.service_order_id = $1
       ORDER BY son.created_at DESC`,
      [req.params.id],
    ),
    query(
      `SELECT mr.*, p.name AS product_name, p.sku
       FROM material_requests mr
       JOIN products p ON p.id = mr.product_id
       WHERE mr.service_order_id = $1
       ORDER BY mr.requested_at DESC`,
      [req.params.id],
    ),
    query(
      `SELECT *
       FROM client_service_history
       WHERE client_id = (SELECT client_id FROM service_orders WHERE id = $1)
       ORDER BY opened_at DESC`,
      [req.params.id],
    ),
  ]);

  if (!order.rows[0]) {
    return res.status(404).json({ error: "OS nao encontrada." });
  }

  res.json({
    order: order.rows[0],
    photos: photos.rows,
    signature: signature.rows[0] || null,
    notes: notes.rows,
    materials: materials.rows,
    client_history: history.rows,
  });
}));

app.post("/os/:id/checkin", requireAuth, asyncRoute(async (req, res) => {
  await assertServiceOrderInCompany(req.user, req.params.id);
  await assertTechnicianOwnsOrder(req.user, req.params.id);

  const result = await transaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE service_orders
       SET started_at = COALESCE(started_at, now()),
           checkin_location = COALESCE($1, checkin_location),
           status = CASE WHEN status = 'aberta' THEN 'em_andamento' ELSE status END
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [req.body.location || null, req.params.id, req.user.company_id],
    );

    await writeAudit(client, req.user, "service_order", req.params.id, "checkin", { location: req.body.location || null });
    return rows[0];
  });

  res.json(result);
}));

app.post("/os", requireAuth, allowRoles("admin", "estoque", "instrutor_os"), asyncRoute(async (req, res) => {
  requireFields(req.body, ["os_number", "client_id", "service_address", "description"]);
  await assertRecordInCompany("clients", req.body.client_id, req.user.company_id, "Cliente");
  await assertRecordInCompany("technicians", req.body.technician_id, req.user.company_id, "Tecnico");
  await assertRecordInCompany("teams", req.body.team_id, req.user.company_id, "Equipe");

  const { rows } = await query(
    `INSERT INTO service_orders (
       company_id, os_number, client_id, technician_id, team_id, created_by,
       service_address, description, status, priority, due_at, service_value,
       payment_method, payment_status, notes
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'aberta'), COALESCE($10, 'normal'), $11, COALESCE($12, 0), $13, COALESCE($14, 'pendente'), $15)
     RETURNING *`,
    [
      req.user.company_id,
      req.body.os_number,
      req.body.client_id,
      req.body.technician_id || null,
      req.body.team_id || null,
      req.user.id,
      req.body.service_address,
      req.body.description,
      req.body.status || null,
      req.body.priority || null,
      req.body.due_at || null,
      req.body.service_value || 0,
      req.body.payment_method || null,
      req.body.payment_status || null,
      req.body.notes || null,
    ],
  );

  res.status(201).json(rows[0]);
}));

app.patch("/os/:id", requireAuth, asyncRoute(async (req, res) => {
  await assertTechnicianOwnsOrder(req.user, req.params.id);

  if (!["admin", "instrutor_os", "tecnico"].includes(req.user.role)) {
    return res.status(403).json({ error: "Perfil sem permissao para editar OS." });
  }

  const adminFields = [
    "client_id",
    "technician_id",
    "team_id",
    "service_address",
    "description",
    "status",
    "priority",
    "due_at",
    "service_value",
    "payment_method",
    "payment_status",
    "tracker_chip_id",
    "notes",
  ];
  const technicianFields = ["status", "tracker_chip_id", "notes"];
  const allowed = req.user.role === "tecnico" ? technicianFields : adminFields;
  const updates = allowed.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field));

  if (updates.length === 0) {
    return res.status(400).json({ error: "Nenhum campo permitido foi enviado." });
  }

  const assignments = updates.map((field, index) => `${field} = $${index + 2}`);
  const values = updates.map((field) => req.body[field]);

  if (updates.includes("tracker_chip_id")) {
    assignments.push(`tracker_chip_verified_at = $${updates.length + 2}`);
    values.push(req.body.tracker_chip_id ? new Date() : null);
  }

  const { rows } = await query(
    `UPDATE service_orders
     SET ${assignments.join(", ")}
     WHERE id = $1 AND company_id = $${values.length + 2}
     RETURNING *`,
    [req.params.id, ...values, req.user.company_id],
  );

  if (!rows[0]) {
    return res.status(404).json({ error: "OS nao encontrada." });
  }

  res.json(rows[0]);
}));

app.get("/estoque", requireAuth, allowRoles("admin", "estoque", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const { rows } = await query(
    `SELECT *
     FROM product_stock
     WHERE company_id = $1
     ORDER BY name`,
    [req.user.company_id],
  );

  res.json(rows);
}));

app.get("/estoque/baixos", requireAuth, allowRoles("admin", "estoque", "vendedor"), asyncRoute(async (req, res) => {
  const { rows } = await query(
    `SELECT *
     FROM product_stock
     WHERE company_id = $1
       AND quantity_total <= min_quantity
     ORDER BY quantity_total ASC, name`,
    [req.user.company_id],
  );

  res.json(rows);
}));

app.get("/estoque/historico", requireAuth, allowRoles("admin", "estoque", "vendedor"), asyncRoute(async (req, res) => {
  const { rows } = await query(
    `SELECT
       sm.id,
       sm.movement_type AS type,
       sm.quantity,
       sm.stock_before,
       sm.stock_after,
       sm.reason,
       sm.supplier,
       sm.notes,
       sm.created_at,
       p.name AS product_name,
       p.sku,
       u.name AS user_name
     FROM stock_movements sm
     JOIN products p ON p.id = sm.product_id
     LEFT JOIN users u ON u.id = sm.user_id
     WHERE p.company_id = $1
     ORDER BY sm.created_at DESC
     LIMIT 200`,
    [req.user.company_id],
  );

  res.json(rows);
}));

app.post("/estoque/entrada", requireAuth, allowRoles("admin", "estoque"), asyncRoute(async (req, res) => {
  requireFields(req.body, ["quantity"]);
  const identifier = req.body.product_id || req.body.sku || req.body.qr_code_value;

  if (!identifier) {
    return res.status(400).json({ error: "Informe product_id, sku ou qr_code_value." });
  }

  const result = await transaction(async (client) => {
    const currentProduct = await findProductForStock(client, req.user, identifier);
    const quantity = Number(req.body.quantity);
    const stockBefore = Number(currentProduct.quantity_total);
    const stockAfter = stockBefore + quantity;

    const product = await client.query(
      `UPDATE products
       SET quantity_total = quantity_total + $1
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [quantity, currentProduct.id, req.user.company_id],
    );

    await client.query(
      `INSERT INTO stock_movements (
         product_id, movement_type, quantity, stock_before, stock_after,
         reason, supplier, user_id, notes
       )
       VALUES ($1, 'entrada', $2, $3, $4, $5, $6, $7, $8)`,
      [
        currentProduct.id,
        quantity,
        stockBefore,
        stockAfter,
        req.body.reason || req.body.motivo || "reposicao",
        req.body.supplier || req.body.fornecedor || null,
        req.user.id,
        req.body.notes || "Entrada manual",
      ],
    );

    return product.rows[0];
  });

  res.status(201).json(result);
}));

app.post("/estoque/saida", requireAuth, allowRoles("admin", "estoque", "vendedor"), asyncRoute(async (req, res) => {
  requireFields(req.body, ["quantity", "reason"]);
  const identifier = req.body.product_id || req.body.sku || req.body.qr_code_value;

  if (!identifier) {
    return res.status(400).json({ error: "Informe product_id, sku ou qr_code_value." });
  }

  const allowedReasons = ["venda", "OS", "troca", "perda", "garantia"];
  if (!allowedReasons.includes(req.body.reason)) {
    return res.status(400).json({ error: "Motivo invalido para saida." });
  }

  const result = await transaction(async (client) => {
    const currentProduct = await findProductForStock(client, req.user, identifier);
    const quantity = Number(req.body.quantity);
    const stockBefore = Number(currentProduct.quantity_total);
    const stockAfter = stockBefore - quantity;

    if (stockAfter < 0) {
      const error = new Error("Estoque insuficiente para registrar saida.");
      error.status = 409;
      throw error;
    }

    const product = await client.query(
      `UPDATE products
       SET quantity_total = quantity_total - $1
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [quantity, currentProduct.id, req.user.company_id],
    );

    await client.query(
      `INSERT INTO stock_movements (
         product_id, movement_type, quantity, stock_before, stock_after,
         reason, user_id, service_order_id, notes
       )
       VALUES ($1, 'saida', $2, $3, $4, $5, $6, $7, $8)`,
      [
        currentProduct.id,
        quantity,
        stockBefore,
        stockAfter,
        req.body.reason,
        req.user.id,
        req.body.service_order_id || null,
        req.body.notes || "Saida manual",
      ],
    );

    return product.rows[0];
  });

  res.status(201).json(result);
}));

app.post("/os/:id/material", requireAuth, asyncRoute(async (req, res) => {
  requireFields(req.body, ["product_id", "quantity"]);
  await assertServiceOrderInCompany(req.user, req.params.id);
  await assertProductInCompany(req.user, req.body.product_id);
  await assertTechnicianOwnsOrder(req.user, req.params.id);

  const { rows } = await query(
    `INSERT INTO material_requests (service_order_id, requested_by, product_id, quantity, justification)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.params.id, req.user.id, req.body.product_id, req.body.quantity, req.body.justification || null],
  );

  res.status(201).json(rows[0]);
}));

app.post("/os/:id/fotos", requireAuth, asyncRoute(async (req, res) => {
  requireFields(req.body, ["photo_type", "file_url"]);
  await assertServiceOrderInCompany(req.user, req.params.id);
  await assertTechnicianOwnsOrder(req.user, req.params.id);

  const result = await transaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO service_order_photos (
         service_order_id, photo_type, file_url, storage_key, file_name,
         mime_type, file_size_bytes, uploaded_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.params.id,
        req.body.photo_type,
        req.body.file_url,
        req.body.storage_key || null,
        req.body.file_name || null,
        req.body.mime_type || null,
        req.body.file_size_bytes || null,
        req.user.id,
      ],
    );

    await writeAudit(client, req.user, "service_order", req.params.id, "upload_photo", rows[0]);
    return rows[0];
  });

  res.status(201).json(result);
}));

app.post("/os/:id/assinatura", requireAuth, asyncRoute(async (req, res) => {
  requireFields(req.body, ["client_name", "signature_url"]);
  await assertServiceOrderInCompany(req.user, req.params.id);
  await assertTechnicianOwnsOrder(req.user, req.params.id);

  const result = await transaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO service_order_signatures (
         service_order_id, client_name, signature_url, storage_key,
         file_name, mime_type, file_size_bytes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (service_order_id)
       DO UPDATE SET
         client_name = EXCLUDED.client_name,
         signature_url = EXCLUDED.signature_url,
         storage_key = EXCLUDED.storage_key,
         file_name = EXCLUDED.file_name,
         mime_type = EXCLUDED.mime_type,
         file_size_bytes = EXCLUDED.file_size_bytes,
         signed_at = now()
       RETURNING *`,
      [
        req.params.id,
        req.body.client_name,
        req.body.signature_url,
        req.body.storage_key || null,
        req.body.file_name || null,
        req.body.mime_type || null,
        req.body.file_size_bytes || null,
      ],
    );

    await writeAudit(client, req.user, "service_order", req.params.id, "capture_signature", rows[0]);
    return rows[0];
  });

  res.status(201).json(result);
}));

app.post("/os/:id/observacoes", requireAuth, asyncRoute(async (req, res) => {
  requireFields(req.body, ["note"]);
  await assertServiceOrderInCompany(req.user, req.params.id);
  await assertTechnicianOwnsOrder(req.user, req.params.id);

  const result = await transaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO service_order_notes (service_order_id, user_id, note)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, req.user.id, req.body.note],
    );

    await client.query(
      `UPDATE service_orders
       SET technician_notes = CONCAT_WS(E'\n', technician_notes, $1)
       WHERE id = $2`,
      [req.body.note, req.params.id],
    );

    await writeAudit(client, req.user, "service_order", req.params.id, "add_technician_note", rows[0]);
    return rows[0];
  });

  res.status(201).json(result);
}));

async function updateMaterialStatus(req, res, status, userColumn) {
  const { rows } = await query(
    `UPDATE material_requests mr
     SET status = $1, ${userColumn} = $2
     FROM service_orders so
     WHERE mr.id = $3
       AND mr.service_order_id = so.id
       AND so.company_id = $4
     RETURNING mr.*`,
    [status, req.user.id, req.params.id, req.user.company_id],
  );

  if (!rows[0]) {
    return res.status(404).json({ error: "Solicitacao de material nao encontrada." });
  }

  return res.json(rows[0]);
}

app.patch("/material/:id/aprovar", requireAuth, allowRoles("admin", "estoque"), asyncRoute((req, res) => (
  updateMaterialStatus(req, res, "aprovada", "approved_by")
)));

app.patch("/material/:id/negar", requireAuth, allowRoles("admin", "estoque"), asyncRoute((req, res) => (
  updateMaterialStatus(req, res, "negada", "approved_by")
)));

app.patch("/material/:id/separar", requireAuth, allowRoles("admin", "estoque"), asyncRoute((req, res) => (
  updateMaterialStatus(req, res, "separada", "separated_by")
)));

app.patch("/material/:id/retirar", requireAuth, allowRoles("admin", "estoque"), asyncRoute((req, res) => (
  updateMaterialStatus(req, res, "retirada", "withdrawn_by")
)));

app.get("/traccar/status", requireAuth, allowRoles("admin", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const config = getTraccarConfig();

  res.json({
    configured: Boolean(config.url && (config.token || (config.email && config.password))),
    url: config.url || null,
    auth: config.token ? "token" : config.email ? "basic" : "missing",
    websocket_endpoint: config.url ? `${config.url}/api/socket` : null,
  });
}));

app.post("/traccar/testar", requireAuth, allowRoles("admin", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const devices = await fetchDevices({ limit: 1 });
  res.json({
    ok: true,
    devices_found: Array.isArray(devices) ? devices.length : 0,
  });
}));

app.get("/traccar/dispositivos", requireAuth, allowRoles("admin", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const devices = await fetchDevices({
    all: req.query.all,
    id: req.query.id,
    uniqueId: req.query.uniqueId,
    limit: req.query.limit,
    offset: req.query.offset,
    keyword: req.query.keyword,
  });

  res.json(devices);
}));

app.get("/traccar/posicoes", requireAuth, allowRoles("admin", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const positions = await fetchPositions({
    deviceId: req.query.deviceId,
    from: req.query.from,
    to: req.query.to,
    id: req.query.id,
  });

  res.json(positions);
}));

app.post("/traccar/sincronizar", requireAuth, allowRoles("admin", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const body = req.body || {};
  const result = await syncTraccarSnapshot(req.user, {
    all: body.all ?? req.query.all,
    position_id: body.position_id ?? req.query.position_id,
  });

  res.status(201).json({
    devices_synced: result.devices.length,
    positions_synced: result.positions.length,
    devices: result.devices,
    positions: result.positions,
  });
}));

app.get("/veiculos", requireAuth, allowRoles("admin", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const params = [req.user.company_id];
  let teamFilter = "";

  if (req.query.team_id) {
    params.push(req.query.team_id);
    teamFilter = `AND v.team_id = $${params.length}`;
  }

  const { rows } = await query(
    `SELECT v.*, t.name AS team_name
     FROM vehicles v
     LEFT JOIN teams t ON t.id = v.team_id
     WHERE v.company_id = $1 ${teamFilter}
     ORDER BY v.name`,
    params,
  );

  res.json(rows);
}));

app.post("/veiculos", requireAuth, allowRoles("admin", "instrutor_os"), asyncRoute(async (req, res) => {
  requireFields(req.body, ["name"]);
  await assertTeamInCompany(req.user, req.body.team_id);

  const { rows } = await query(
    `INSERT INTO vehicles (company_id, team_id, name, plate, model, tracker_chip_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      req.user.company_id,
      req.body.team_id || null,
      req.body.name,
      req.body.plate || null,
      req.body.model || null,
      req.body.tracker_chip_id || null,
      req.body.notes || null,
    ],
  );

  res.status(201).json(rows[0]);
}));

app.patch("/veiculos/:id", requireAuth, allowRoles("admin", "instrutor_os"), asyncRoute(async (req, res) => {
  await assertTeamInCompany(req.user, req.body.team_id);

  const allowed = ["team_id", "name", "plate", "model", "tracker_chip_id", "notes", "active"];
  const updates = allowed.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field));

  if (updates.length === 0) {
    return res.status(400).json({ error: "Nenhum campo permitido foi enviado." });
  }

  const assignments = updates.map((field, index) => `${field} = $${index + 3}`);
  const values = updates.map((field) => req.body[field]);

  const { rows } = await query(
    `UPDATE vehicles
     SET ${assignments.join(", ")}, updated_at = now()
     WHERE id = $1 AND company_id = $2
     RETURNING *`,
    [req.params.id, req.user.company_id, ...values],
  );

  if (!rows[0]) {
    return res.status(404).json({ error: "Veiculo nao encontrado." });
  }

  res.json(rows[0]);
}));

app.patch("/traccar/dispositivos/:id/vincular", requireAuth, allowRoles("admin", "instrutor_os"), asyncRoute(async (req, res) => {
  await assertTeamInCompany(req.user, req.body.team_id);

  if (req.body.vehicle_id) {
    const vehicle = await query(
      "SELECT 1 FROM vehicles WHERE id = $1 AND company_id = $2",
      [req.body.vehicle_id, req.user.company_id],
    );

    if (!vehicle.rows[0]) {
      return res.status(404).json({ error: "Veiculo nao encontrado." });
    }
  }

  const { rows } = await query(
    `UPDATE traccar_devices
     SET vehicle_id = COALESCE($3, vehicle_id),
         team_id = COALESCE($4, team_id),
         synced_at = now()
     WHERE id = $1 AND company_id = $2
     RETURNING *`,
    [
      req.params.id,
      req.user.company_id,
      req.body.vehicle_id || null,
      req.body.team_id || null,
    ],
  );

  if (!rows[0]) {
    return res.status(404).json({ error: "Dispositivo Traccar nao encontrado. Rode /traccar/sincronizar primeiro." });
  }

  res.json(rows[0]);
}));

app.get("/rastreamento/frota", requireAuth, allowRoles("admin", "instrutor_os", "vendedor"), asyncRoute(async (req, res) => {
  const params = [req.user.company_id];
  let teamFilter = "";

  if (req.query.team_id) {
    params.push(req.query.team_id);
    teamFilter = `AND team_id = $${params.length}`;
  }

  const { rows } = await query(
    `SELECT *
     FROM fleet_tracking_status
     WHERE company_id = $1 ${teamFilter}
     ORDER BY team_name NULLS LAST, vehicle_name NULLS LAST, device_name`,
    params,
  );

  res.json(rows);
}));

app.get("/relatorios/operacional", requireAuth, allowRoles("admin", "estoque", "instrutor_os"), asyncRoute(async (req, res) => {
  const [teams, instructions] = await Promise.all([
    query("SELECT * FROM team_performance_report WHERE company_id = $1 ORDER BY team_name", [req.user.company_id]),
    query("SELECT * FROM instruction_report WHERE company_id = $1 ORDER BY instructor_name", [req.user.company_id]),
  ]);

  res.json({ teams: teams.rows, instructions: instructions.rows });
}));

app.get("/financeiro", requireAuth, allowFinancial, asyncRoute(async (req, res) => {
  const { rows } = await query(
    `SELECT *
     FROM monthly_financial_summary
     WHERE company_id = $1
     ORDER BY month DESC`,
    [req.user.company_id],
  );

  res.json(rows);
}));

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = status >= 500 ? "Erro interno do servidor." : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ error: message });
});

const server = app.listen(port, () => {
  console.log(`API Controle OS rodando na porta ${port}`);
});

function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
