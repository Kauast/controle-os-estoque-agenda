const DEFAULT_TIMEOUT_MS = 12000;

function getTraccarConfig() {
  return {
    url: (process.env.TRACCAR_URL || "").replace(/\/+$/, ""),
    token: process.env.TRACCAR_TOKEN || "",
    email: process.env.TRACCAR_EMAIL || "",
    password: process.env.TRACCAR_PASSWORD || "",
    timeoutMs: Number(process.env.TRACCAR_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
  };
}

function assertConfigured(config = getTraccarConfig()) {
  if (!config.url) {
    const error = new Error("TRACCAR_URL nao configurada no .env.");
    error.status = 503;
    throw error;
  }

  if (!config.token && (!config.email || !config.password)) {
    const error = new Error("Configure TRACCAR_TOKEN ou TRACCAR_EMAIL/TRACCAR_PASSWORD no .env.");
    error.status = 503;
    throw error;
  }
}

function buildHeaders(config) {
  const headers = {
    Accept: "application/json",
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  } else {
    const credentials = Buffer.from(`${config.email}:${config.password}`).toString("base64");
    headers.Authorization = `Basic ${credentials}`;
  }

  return headers;
}

async function traccarRequest(path, options = {}) {
  const config = getTraccarConfig();
  assertConfigured(config);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const url = `${config.url}/api${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    ...buildHeaders(config),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") && text ? JSON.parse(text) : text;

    if (!response.ok) {
      const error = new Error(`Erro Traccar ${response.status}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
      error.status = response.status >= 500 ? 502 : response.status;
      error.traccarStatus = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Tempo esgotado ao chamar a API do Traccar.");
      timeoutError.status = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function toQueryString(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
    } else {
      search.append(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

function fetchDevices(params = {}) {
  return traccarRequest(`/devices${toQueryString(params)}`);
}

function fetchPositions(params = {}) {
  return traccarRequest(`/positions${toQueryString(params)}`);
}

function normalizeDevice(device) {
  return {
    traccar_id: device.id,
    unique_id: device.uniqueId || null,
    name: device.name || `Dispositivo ${device.id}`,
    status: device.status || null,
    disabled: device.disabled ?? null,
    phone: device.phone || null,
    model: device.model || null,
    contact: device.contact || null,
    category: device.category || null,
    position_id: device.positionId || null,
    last_update: device.lastUpdate || null,
    attributes: device.attributes || {},
    raw: device,
  };
}

function normalizePosition(position) {
  return {
    traccar_position_id: position.id || null,
    traccar_device_id: position.deviceId,
    device_time: position.deviceTime || null,
    fix_time: position.fixTime || null,
    server_time: position.serverTime || null,
    valid: position.valid ?? null,
    latitude: position.latitude,
    longitude: position.longitude,
    altitude: position.altitude ?? null,
    speed: position.speed ?? null,
    course: position.course ?? null,
    address: position.address || null,
    accuracy: position.accuracy ?? null,
    attributes: position.attributes || {},
    raw: position,
  };
}

module.exports = {
  fetchDevices,
  fetchPositions,
  getTraccarConfig,
  normalizeDevice,
  normalizePosition,
};
