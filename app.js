const navButtons = document.querySelectorAll(".nav-list button, .mobile-tabs button, .bottom-nav button");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.parentElement.querySelectorAll("button");
    group.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    if (button.closest(".nav-list")) {
      const isFinanceSection = button.textContent.trim().toLowerCase() === "financeiro";
      document.body.classList.toggle("finance-visible", isFinanceSection);
    }
  });
});

document.querySelectorAll(".day").forEach((day) => {
  day.addEventListener("click", () => {
    document.querySelectorAll(".day").forEach((item) => item.classList.remove("selected"));
    day.classList.add("selected");
  });
});

const arrivalButton = document.querySelector(".mobile-actions .primary-button");

if (arrivalButton) {
  arrivalButton.addEventListener("click", () => {
    arrivalButton.textContent = "Atendimento iniciado";
    arrivalButton.classList.add("started");
  });
}

const productCards = document.querySelectorAll(".product-card");
const productSearch = document.querySelector(".product-search");
const productQty = document.querySelector(".product-qty");
const addProductButton = document.querySelector(".add-product-button");
const clientProductList = document.querySelector(".client-product-list");
const clientTotal = document.querySelector(".client-total");
const selectedProducts = [{ name: "Fonte 12V 2A", qty: 1, price: 48 }];

function parseCurrency(value) {
  return Number(value.replace(".", "").replace(",", "."));
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function renderClientProducts() {
  if (!clientProductList || !clientTotal) return;

  clientProductList.innerHTML = "";

  selectedProducts.forEach((item) => {
    const row = document.createElement("div");
    row.className = "client-product-row";
    row.innerHTML = `<span>${item.qty}x ${item.name}</span><strong class="financial-content">${formatCurrency(item.qty * item.price)}</strong>`;
    clientProductList.appendChild(row);
  });

  const total = selectedProducts.reduce((sum, item) => sum + item.qty * item.price, 0);
  clientTotal.textContent = formatCurrency(total);
}

productCards.forEach((card) => {
  card.addEventListener("click", () => {
    productCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
  });
});

if (productSearch) {
  productSearch.addEventListener("input", () => {
    const term = productSearch.value.trim().toLowerCase();

    productCards.forEach((card) => {
      const product = card.dataset.product.toLowerCase();
      card.hidden = term.length > 0 && !product.includes(term);
    });
  });
}

if (addProductButton) {
  addProductButton.addEventListener("click", () => {
    const selectedCard = document.querySelector(".product-card.active");
    if (!selectedCard) return;

    const qty = Math.max(1, Number(productQty.value || 1));
    selectedProducts.push({
      name: selectedCard.dataset.product,
      qty,
      price: parseCurrency(selectedCard.dataset.price)
    });

    productQty.value = "1";
    addProductButton.textContent = "Solicitacao criada";
    renderClientProducts();

    window.setTimeout(() => {
      addProductButton.textContent = "Solicitar material";
    }, 1200);
  });
}

renderClientProducts();

const inventoryProducts = [
  { id: 1, name: "Fonte 12V 2A", sku: "FON-12V-2A", category: "Eletrica", location: "Prateleira A1", qty: 8, min: 20, cost: 29, price: 48, qr: "PROD:FON-12V-2A" },
  { id: 2, name: "Bateria 7Ah", sku: "BAT-7AH", category: "Energia", location: "Prateleira A2", qty: 10, min: 12, cost: 62, price: 96, qr: "PROD:BAT-7AH" },
  { id: 3, name: "Cabo UTP Cat6", sku: "CAB-CAT6", category: "Rede", location: "Corredor B1", qty: 5, min: 6, cost: 270, price: 420, qr: "PROD:CAB-CAT6" },
  { id: 4, name: "Sensor magnetico", sku: "SEN-MAG", category: "Alarme", location: "Gaveta C3", qty: 42, min: 30, cost: 18, price: 32, qr: "PROD:SEN-MAG" },
  { id: 5, name: "Camera dome Full HD", sku: "CAM-DOME-FHD", category: "CFTV", location: "Armario D1", qty: 14, min: 8, cost: 128, price: 189, qr: "PROD:CAM-DOME-FHD" },
  { id: 6, name: "Controle remoto TX", sku: "CTRL-TX", category: "Automacao", location: "Gaveta C1", qty: 24, min: 15, cost: 34, price: 58, qr: "PROD:CTRL-TX" }
];

const stockMovements = [
  { product: "Fonte 12V 2A", type: "saida", qty: 1, user: "Estoque", date: "Hoje 10:05", reason: "OS", before: 9, after: 8 },
  { product: "Bateria 7Ah", type: "entrada", qty: 4, user: "Estoque", date: "Hoje 08:20", reason: "Fornecedor B", before: 6, after: 10 }
];

let selectedInventoryProductId = 1;

const inventoryProductList = document.querySelector(".inventory-product-list");
const lowStockList = document.querySelector(".low-stock-list");
const stockHistoryList = document.querySelector(".stock-history-list");
const stockLowCount = document.querySelector(".stock-low-count");
const stockTotalProducts = document.querySelector(".stock-total-products");
const stockAlertProducts = document.querySelector(".stock-alert-products");
const stockLastMovement = document.querySelector(".stock-last-movement");
const selectedStockName = document.querySelector(".selected-stock-name");
const selectedStockMeta = document.querySelector(".selected-stock-meta");
const qrLabel = document.querySelector(".qr-label");
const stockScanInput = document.querySelector(".stock-scan-input");
const scanProductButton = document.querySelector(".scan-product-button");
const startQrCameraButton = document.querySelector(".start-qr-camera-button");
const qrScannerVideo = document.querySelector(".qr-scanner-video");
const qrScannerStatus = document.querySelector(".qr-scanner-status");
const inventoryProductForm = document.querySelector(".inventory-product-form");
const stockEntryForm = document.querySelector(".stock-entry-form");
const stockExitForm = document.querySelector(".stock-exit-form");
const printQrButton = document.querySelector(".print-qr-button");

function getStockStatus(product) {
  if (product.qty <= product.min * 0.5) return { label: "Critico", className: "critical", pill: "red" };
  if (product.qty <= product.min) return { label: "Baixo", className: "low", pill: "amber" };
  return { label: "Ok", className: "ok", pill: "teal" };
}

function findInventoryProduct(identifier) {
  const normalized = String(identifier || "").trim().toLowerCase();
  return inventoryProducts.find((product) => (
    String(product.id) === normalized ||
    product.sku.toLowerCase() === normalized ||
    product.qr.toLowerCase() === normalized
  ));
}

function createQrMatrix(value) {
  let seed = Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  let cells = "";

  for (let index = 0; index < 81; index += 1) {
    const x = index % 9;
    const y = Math.floor(index / 9);
    const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const on = finder || seed % 5 < 2;
    cells += `<span class="qr-cell${on ? " on" : ""}"></span>`;
  }

  return `<div class="qr-matrix" aria-hidden="true">${cells}</div>`;
}

function renderQrLabel(product) {
  if (!qrLabel || !product) return;

  const encodedQr = encodeURIComponent(product.qr);
  qrLabel.innerHTML = `
    <img class="qr-code-img" src="https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodedQr}" alt="QR Code ${product.sku}" />
    <div class="qr-fallback">${createQrMatrix(product.qr)}</div>
    <strong>${product.sku}</strong>
    <small>${product.qr}</small>
  `;
}

function renderInventory() {
  if (!inventoryProductList) return;

  inventoryProductList.innerHTML = "";

  inventoryProducts.forEach((product) => {
    const status = getStockStatus(product);
    const row = document.createElement("button");
    row.type = "button";
    row.className = `inventory-product-row ${status.className}`;
    row.classList.toggle("active", product.id === selectedInventoryProductId);
    row.innerHTML = `
      <span>
        <strong>${product.name}</strong>
        <small>${product.sku} - ${product.category} - ${product.location}</small>
      </span>
      <span>
        <strong>${product.qty}</strong>
        <small>min. ${product.min}</small>
        <span class="pill ${status.pill}">${status.label}</span>
      </span>
    `;
    row.addEventListener("click", () => {
      selectedInventoryProductId = product.id;
      renderInventory();
    });
    inventoryProductList.appendChild(row);
  });

  const selectedProduct = inventoryProducts.find((product) => product.id === selectedInventoryProductId) || inventoryProducts[0];
  const lowProducts = inventoryProducts.filter((product) => product.qty <= product.min);

  if (selectedStockName && selectedProduct) {
    selectedStockName.textContent = selectedProduct.name;
    selectedStockMeta.textContent = `${selectedProduct.sku} - ${selectedProduct.location}`;
    renderQrLabel(selectedProduct);
  }

  if (stockLowCount) stockLowCount.textContent = `${lowProducts.length} baixos`;
  if (stockTotalProducts) stockTotalProducts.textContent = inventoryProducts.length;
  if (stockAlertProducts) stockAlertProducts.textContent = lowProducts.length;
  if (stockLastMovement) stockLastMovement.textContent = stockMovements[0]?.reason || "-";

  if (lowStockList) {
    lowStockList.innerHTML = lowProducts.map((product) => `
      <div class="low-stock-item">
        <strong>${product.name}</strong>
        <small>${product.qty} atual / minimo ${product.min} - ${product.location}</small>
      </div>
    `).join("");
  }

  if (stockHistoryList) {
    stockHistoryList.innerHTML = stockMovements.slice(0, 8).map((movement) => `
      <div class="stock-history-item">
        <span>
          <strong>${movement.product}</strong>
          <small>${movement.type} - ${movement.qty} un. - ${movement.reason}</small>
          <small>${movement.user} - ${movement.date}</small>
        </span>
        <span>
          <strong>${movement.before} -> ${movement.after}</strong>
        </span>
      </div>
    `).join("");
  }
}

function registerStockMovement({ product, type, qty, reason, user = "Estoque" }) {
  const before = product.qty;
  const after = type === "entrada" ? before + qty : before - qty;

  if (after < 0) {
    return false;
  }

  product.qty = after;
  stockMovements.unshift({
    product: product.name,
    type,
    qty,
    user,
    date: "Agora",
    reason,
    before,
    after
  });
  selectedInventoryProductId = product.id;
  renderInventory();
  return true;
}

if (inventoryProductForm) {
  inventoryProductForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const sku = document.querySelector(".stock-product-sku").value.trim().toUpperCase();
    const product = {
      id: Math.max(0, ...inventoryProducts.map((item) => item.id)) + 1,
      name: document.querySelector(".stock-product-name").value.trim(),
      sku,
      category: document.querySelector(".stock-product-category").value.trim(),
      location: document.querySelector(".stock-product-location").value.trim(),
      qty: Number(document.querySelector(".stock-product-qty").value || 0),
      min: Number(document.querySelector(".stock-product-min").value || 0),
      cost: Number(document.querySelector(".stock-product-cost").value || 0),
      price: Number(document.querySelector(".stock-product-price").value || 0),
      qr: `PROD:${sku}`
    };

    inventoryProducts.push(product);
    selectedInventoryProductId = product.id;
    inventoryProductForm.reset();
    document.querySelector(".stock-product-qty").value = "0";
    document.querySelector(".stock-product-min").value = "1";
    document.querySelector(".stock-product-cost").value = "0";
    document.querySelector(".stock-product-price").value = "0";
    renderInventory();
  });
}

if (scanProductButton) {
  scanProductButton.addEventListener("click", () => {
    const product = findInventoryProduct(stockScanInput.value);
    if (!product) {
      stockScanInput.value = "";
      stockScanInput.placeholder = "Produto nao encontrado";
      return;
    }

    selectedInventoryProductId = product.id;
    document.querySelector(".entry-identifier").value = product.sku;
    document.querySelector(".exit-identifier").value = product.sku;
    renderInventory();
  });
}

if (startQrCameraButton) {
  startQrCameraButton.addEventListener("click", async () => {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
      qrScannerStatus.textContent = "Camera indisponivel. Digite ou cole o SKU/QR no campo acima.";
      stockScanInput?.focus();
      return;
    }

    try {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      qrScannerVideo.srcObject = stream;
      qrScannerVideo.classList.add("active");
      await qrScannerVideo.play();
      qrScannerStatus.textContent = "Aponte a camera para o QR Code do produto";

      const scan = async () => {
        const codes = await detector.detect(qrScannerVideo);
        if (codes[0]) {
          stockScanInput.value = codes[0].rawValue;
          qrScannerStatus.textContent = `QR lido: ${codes[0].rawValue}`;
          stream.getTracks().forEach((track) => track.stop());
          qrScannerVideo.classList.remove("active");
          scanProductButton?.click();
          return;
        }

        if (qrScannerVideo.classList.contains("active")) {
          window.requestAnimationFrame(scan);
        }
      };

      scan();
    } catch (error) {
      qrScannerStatus.textContent = "Nao foi possivel abrir a camera. Use SKU ou QR manual.";
    }
  });
}

if (stockEntryForm) {
  stockEntryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const product = findInventoryProduct(document.querySelector(".entry-identifier").value);
    if (!product) return;

    registerStockMovement({
      product,
      type: "entrada",
      qty: Number(document.querySelector(".entry-qty").value || 1),
      reason: document.querySelector(".entry-reason").value.trim() || "reposicao"
    });
  });
}

if (stockExitForm) {
  stockExitForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const product = findInventoryProduct(document.querySelector(".exit-identifier").value);
    if (!product) return;

    const ok = registerStockMovement({
      product,
      type: "saida",
      qty: Number(document.querySelector(".exit-qty").value || 1),
      reason: document.querySelector(".exit-reason").value
    });

    if (!ok) {
      document.querySelector(".exit-qty").value = product.qty;
    }
  });
}

if (printQrButton) {
  printQrButton.addEventListener("click", () => {
    const product = inventoryProducts.find((item) => item.id === selectedInventoryProductId);
    if (!product) return;

    const printWindow = window.open("", "_blank", "width=360,height=520");
    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta ${product.sku}</title>
          <style>
            .qr-matrix { width: 132px; height: 132px; display: grid; grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(9, 1fr); gap: 2px; padding: 6px; border: 1px solid #111; margin: 12px auto; }
            .qr-cell { background: #fff; }
            .qr-cell.on { background: #111; }
            img { width: 132px; height: 132px; display: block; margin: 12px auto; }
          </style>
        </head>
        <body style="font-family: Arial, sans-serif; display: grid; place-items: center; min-height: 100vh;">
          <div style="border: 1px solid #111; padding: 18px; text-align: center;">
            <h2>${product.name}</h2>
            <p>${product.sku}</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(product.qr)}" alt="QR Code ${product.sku}" />
            <p>${product.qr}</p>
            <small>${product.location}</small>
          </div>
          <script>window.print();<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  });
}

let draggedCard = null;

function getPriorityRank(element) {
  if (element.classList.contains("high")) return 0;
  if (element.classList.contains("warning")) return 1;
  return 2;
}

function getScheduleTime(element) {
  const text = element.textContent || "";
  const match = text.match(/\b(\d{2}):(\d{2})\b/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 9999;
}

function sortPriorityItems(container, selector) {
  if (!container) return;

  const items = Array.from(container.querySelectorAll(selector));
  items
    .sort((a, b) => getPriorityRank(a) - getPriorityRank(b) || getScheduleTime(a) - getScheduleTime(b))
    .forEach((item) => container.appendChild(item));
}

function sortServiceOrdersByPriority() {
  sortPriorityItems(document.querySelector(".available-orders"), ".dispatch-card");
  sortPriorityItems(document.querySelector(".order-list"), ".order-row");
}

function refreshDropzones() {
  document.querySelectorAll(".team-dropzone").forEach((zone) => {
    const hasCard = zone.querySelector(".dispatch-card");
    const emptyText = zone.querySelector(".empty-placeholder");

    if (!hasCard && !emptyText) {
      const placeholder = document.createElement("span");
      placeholder.className = "empty-placeholder";
      placeholder.textContent = "Solte uma OS aqui";
      zone.appendChild(placeholder);
      zone.classList.add("empty-state");
    }

    if (hasCard) {
      zone.classList.remove("empty-state");
      emptyText?.remove();
    }
  });
}

function bindDispatchCard(card) {
  card.addEventListener("dragstart", () => {
    draggedCard = card;
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    draggedCard = null;
    refreshDropzones();
  });
}

document.querySelectorAll(".dispatch-card").forEach(bindDispatchCard);

document.querySelectorAll(".team-dropzone, .available-orders").forEach((zone) => {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", () => {
    zone.classList.remove("drag-over");
    if (!draggedCard) return;

    zone.querySelector(".empty-placeholder")?.remove();
    zone.appendChild(draggedCard);
    if (zone.classList.contains("available-orders")) {
      sortPriorityItems(zone, ".dispatch-card");
    }
    refreshDropzones();
  });
});

const photoProofs = document.querySelectorAll(".photo-proof");
const capturePhotoButton = document.querySelector(".capture-photo-button");
const signatureBox = document.querySelector(".signature-box");
const signatureCanvas = document.querySelector(".signature-canvas");
const signatureLine = document.querySelector(".signature-line");
const clearSignatureButton = document.querySelector(".clear-signature-button");
const confirmSignatureButton = document.querySelector(".confirm-signature-button");
const finishOsButton = document.querySelector(".finish-os-button");
const completionStatus = document.querySelector(".completion-status");
const trackerChipInput = document.querySelector(".tracker-chip-input");
const verifyChipButton = document.querySelector(".verify-chip-button");
const trackerChipStatus = document.querySelector(".tracker-chip-status");
const checkinButton = document.querySelector(".checkin-button");
const checkinStatus = document.querySelector(".checkin-status");
const desktopCheckinStatus = document.querySelector(".desktop-checkin-status");
const saveServiceNoteButton = document.querySelector(".save-service-note-button");
const serviceNotesInput = document.querySelector(".service-notes-input");
const serviceNoteStatus = document.querySelector(".service-note-status");
let trackerChipVerified = false;
let attendanceStarted = false;
let signatureHasInk = false;
let isSigning = false;
let lastSignaturePoint = null;

function normalizeTrackerChip(value) {
  return value.replace(/\D/g, "");
}

function updateCompletionState() {
  const capturedPhotos = document.querySelectorAll(".photo-proof.captured").length;
  const hasSignature = signatureBox?.classList.contains("signed");
  const canFinish = attendanceStarted && capturedPhotos >= 3 && hasSignature && trackerChipVerified;

  if (finishOsButton) {
    finishOsButton.disabled = !canFinish;
  }

  if (completionStatus) {
    if (canFinish) {
      completionStatus.textContent = "Liberado";
    } else if (!attendanceStarted) {
      completionStatus.textContent = "Atendimento pendente";
    } else if (capturedPhotos < 3) {
      completionStatus.textContent = `${capturedPhotos}/3 fotos`;
    } else if (!hasSignature) {
      completionStatus.textContent = "Assinatura pendente";
    } else {
      completionStatus.textContent = "ID CHIP pendente";
    }

    completionStatus.classList.toggle("amber", !canFinish);
    completionStatus.classList.toggle("teal", canFinish);
  }
}

if (checkinButton) {
  checkinButton.addEventListener("click", () => {
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    attendanceStarted = true;
    checkinButton.textContent = "Atendimento iniciado";
    checkinButton.classList.add("started");

    if (checkinStatus) {
      checkinStatus.textContent = `Check-in registrado as ${time}. GPS opcional aguardando permissao.`;
    }

    if (desktopCheckinStatus) {
      desktopCheckinStatus.textContent = "Iniciado";
    }

    updateCompletionState();
  });
}

if (saveServiceNoteButton) {
  saveServiceNoteButton.addEventListener("click", () => {
    const text = serviceNotesInput?.value.trim();

    if (!text) {
      serviceNoteStatus.textContent = "Escreva a observacao tecnica antes de salvar.";
      return;
    }

    serviceNoteStatus.textContent = "Observacao tecnica salva no historico da OS.";
  });
}

photoProofs.forEach((photo) => {
  photo.addEventListener("click", () => {
    photo.classList.add("captured");
    updateCompletionState();
  });
});

if (capturePhotoButton) {
  capturePhotoButton.addEventListener("click", () => {
    const nextPhoto = document.querySelector(".photo-proof:not(.captured)");
    if (nextPhoto) {
      nextPhoto.classList.add("captured");
    }
    updateCompletionState();
  });
}

function getSignaturePoint(event) {
  const rect = signatureCanvas.getBoundingClientRect();
  const source = event.touches?.[0] || event.changedTouches?.[0] || event;

  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top
  };
}

function setupSignatureCanvas() {
  if (!signatureCanvas) return;

  const context = signatureCanvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = signatureCanvas.getBoundingClientRect();

  signatureCanvas.width = Math.max(1, Math.round(rect.width * ratio));
  signatureCanvas.height = Math.max(1, Math.round(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 2.6;
  context.strokeStyle = "#17191c";
}

function clearSignature() {
  if (!signatureCanvas) return;

  const context = signatureCanvas.getContext("2d");
  context.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  signatureHasInk = false;
  signatureBox?.classList.remove("signed");
  if (signatureLine) signatureLine.textContent = "Pendente";
  if (confirmSignatureButton) confirmSignatureButton.disabled = true;
  updateCompletionState();
}

function startSignature(event) {
  if (!signatureCanvas) return;

  event.preventDefault();
  isSigning = true;
  lastSignaturePoint = getSignaturePoint(event);
}

function drawSignature(event) {
  if (!isSigning || !lastSignaturePoint || !signatureCanvas) return;

  event.preventDefault();
  const point = getSignaturePoint(event);
  const context = signatureCanvas.getContext("2d");

  context.beginPath();
  context.moveTo(lastSignaturePoint.x, lastSignaturePoint.y);
  context.lineTo(point.x, point.y);
  context.stroke();

  lastSignaturePoint = point;
  signatureHasInk = true;
  signatureBox?.classList.remove("signed");
  if (signatureLine) signatureLine.textContent = "Assinatura capturada";
  if (confirmSignatureButton) confirmSignatureButton.disabled = false;
  updateCompletionState();
}

function stopSignature() {
  isSigning = false;
  lastSignaturePoint = null;
}

if (signatureCanvas) {
  setupSignatureCanvas();
  window.addEventListener("resize", setupSignatureCanvas);
  signatureCanvas.addEventListener("pointerdown", startSignature);
  signatureCanvas.addEventListener("pointermove", drawSignature);
  signatureCanvas.addEventListener("pointerup", stopSignature);
  signatureCanvas.addEventListener("pointerleave", stopSignature);
  signatureCanvas.addEventListener("touchstart", startSignature, { passive: false });
  signatureCanvas.addEventListener("touchmove", drawSignature, { passive: false });
  signatureCanvas.addEventListener("touchend", stopSignature);
}

if (clearSignatureButton) {
  clearSignatureButton.addEventListener("click", clearSignature);
}

if (confirmSignatureButton) {
  confirmSignatureButton.addEventListener("click", () => {
    if (!signatureHasInk) return;

    signatureBox.classList.add("signed");
    signatureLine.textContent = "Assinatura confirmada";
    updateCompletionState();
  });
}

if (trackerChipInput) {
  trackerChipInput.addEventListener("input", () => {
    trackerChipVerified = false;
    trackerChipInput.classList.remove("verified");

    if (trackerChipStatus) {
      trackerChipStatus.textContent = "Contabilize o ID CHIP";
      trackerChipStatus.classList.remove("verified", "error");
    }

    updateCompletionState();
  });
}

if (verifyChipButton) {
  verifyChipButton.addEventListener("click", () => {
    const chipId = normalizeTrackerChip(trackerChipInput?.value || "");

    if (chipId.length < 10) {
      trackerChipVerified = false;
      trackerChipStatus.textContent = "Informe o ID CHIP completo";
      trackerChipStatus.classList.add("error");
      trackerChipStatus.classList.remove("verified");
      trackerChipInput?.focus();
      updateCompletionState();
      return;
    }

    trackerChipVerified = true;
    trackerChipInput.classList.add("verified");
    trackerChipStatus.textContent = `ID CHIP contabilizado: ${trackerChipInput.value.trim()}`;
    trackerChipStatus.classList.add("verified");
    trackerChipStatus.classList.remove("error");
    updateCompletionState();
  });
}

if (finishOsButton) {
  finishOsButton.addEventListener("click", () => {
    finishOsButton.textContent = "OS concluida";
    completionStatus.textContent = "Concluida";
  });
}

const teamStatusCards = document.querySelectorAll(".team-status-card");
const selectedTeamTitle = document.querySelector(".selected-team-title");
const selectedTeamCopy = document.querySelector(".selected-team-copy");
const technicianList = document.querySelector(".technician-list");
const technicianCount = document.querySelector(".technician-count");
const technicianForm = document.querySelector(".technician-form");
const technicianFormTitle = document.querySelector(".technician-form-title");
const technicianFormState = document.querySelector(".technician-form-state");
const newTechButton = document.querySelector(".new-tech-button");
const techNameInput = document.querySelector(".tech-name-input");
const techPhoneInput = document.querySelector(".tech-phone-input");
const techStatusSelect = document.querySelector(".tech-status-select");
const teamRedirectSelect = document.querySelector(".team-redirect-select");
const deleteTechButton = document.querySelector(".delete-tech-button");
let selectedTechnicianId = 1;

const technicians = [
  { id: 1, name: "Bruno", phone: "(11) 90000-0004", status: "Em atendimento", team: "Equipe 1" },
  { id: 2, name: "Ana", phone: "(11) 90000-0005", status: "A caminho", team: "Equipe 2" },
  { id: 3, name: "Marcos", phone: "(11) 90000-0006", status: "Checklist final", team: "Equipe 3" },
  { id: 4, name: "Diego", phone: "(11) 90000-0007", status: "Disponivel", team: "Equipe 4" }
];

const teamOrder = ["Equipe 1", "Equipe 2", "Equipe 3", "Equipe 4", "Equipe 5"];

function getTeamMembers(team) {
  const members = technicians.filter((tech) => tech.team === team).map((tech) => tech.name);
  return members.length > 0 ? members.join(", ") : "Sem tecnico";
}

function syncTeamSummaries() {
  teamStatusCards.forEach((card) => {
    const team = card.dataset.teamDetail;
    const members = getTeamMembers(team);
    card.dataset.teamMembers = members;

    if (selectedTeamTitle?.textContent === team) {
      selectedTeamCopy.textContent = `${members} - ${card.dataset.teamState} - ${card.dataset.teamOs}`;
    }

    const column = document.querySelector(`.team-column[data-team="${team}"] .team-column-head span:not(.team-status-dot)`);
    if (column) {
      column.textContent = members;
    }
  });
}

function fillTechnicianForm(tech) {
  if (!technicianForm || !techNameInput || !techPhoneInput || !techStatusSelect || !teamRedirectSelect) return;

  selectedTechnicianId = tech?.id || null;
  techNameInput.value = tech?.name || "";
  techPhoneInput.value = tech?.phone || "";
  techStatusSelect.value = tech?.status || "Disponivel";
  teamRedirectSelect.value = tech?.team || "Equipe 1";
  technicianFormTitle.textContent = tech?.name || "Novo tecnico";
  technicianFormState.textContent = tech ? "Selecionado" : "Novo cadastro";
  deleteTechButton.disabled = !tech;
}

function renderTechnicians() {
  if (!technicianList) return;

  technicianList.innerHTML = "";

  technicians.forEach((tech) => {
    const button = document.createElement("button");
    button.className = "technician-row";
    button.type = "button";
    button.classList.toggle("active", tech.id === selectedTechnicianId);
    button.dataset.id = tech.id;
    button.innerHTML = `
      <span>
        <strong>${tech.name}</strong>
        <small>${tech.phone || "Sem telefone"}</small>
      </span>
      <span>
        <strong>${tech.team}</strong>
        <small>${tech.status}</small>
      </span>
    `;
    button.addEventListener("click", () => {
      fillTechnicianForm(tech);
      renderTechnicians();
    });
    technicianList.appendChild(button);
  });

  if (technicianCount) {
    technicianCount.textContent = `${technicians.length} ativo${technicians.length === 1 ? "" : "s"}`;
  }

  syncTeamSummaries();
}

teamStatusCards.forEach((card) => {
  card.addEventListener("click", () => {
    teamStatusCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");

    if (selectedTeamTitle && selectedTeamCopy) {
      selectedTeamTitle.textContent = card.dataset.teamDetail;
      selectedTeamCopy.textContent = `${card.dataset.teamMembers} - ${card.dataset.teamState} - ${card.dataset.teamOs}`;
    }
  });
});

if (newTechButton) {
  newTechButton.addEventListener("click", () => {
    fillTechnicianForm(null);
    renderTechnicians();
    techNameInput?.focus();
  });
}

if (technicianForm) {
  technicianForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = techNameInput.value.trim();
    if (!name) return;

    const data = {
      name,
      phone: techPhoneInput.value.trim(),
      status: techStatusSelect.value,
      team: teamRedirectSelect.value
    };

    if (selectedTechnicianId) {
      const tech = technicians.find((item) => item.id === selectedTechnicianId);
      Object.assign(tech, data);
    } else {
      selectedTechnicianId = Math.max(0, ...technicians.map((item) => item.id)) + 1;
      technicians.push({ id: selectedTechnicianId, ...data });
    }

    const selectedTech = technicians.find((item) => item.id === selectedTechnicianId);
    fillTechnicianForm(selectedTech);
    renderTechnicians();
    technicianFormState.textContent = "Salvo";
  });
}

if (deleteTechButton) {
  deleteTechButton.addEventListener("click", () => {
    if (!selectedTechnicianId) return;

    const index = technicians.findIndex((tech) => tech.id === selectedTechnicianId);
    if (index === -1) return;

    technicians.splice(index, 1);
    const nextTech = technicians[index] || technicians[index - 1] || null;
    fillTechnicianForm(nextTech);
    renderTechnicians();
  });
}

refreshDropzones();
updateCompletionState();
renderTechnicians();
fillTechnicianForm(technicians[0]);
sortServiceOrdersByPriority();
renderInventory();
