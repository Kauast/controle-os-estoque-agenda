const navButtons = document.querySelectorAll(".nav-list button, .mobile-tabs button, .bottom-nav button");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.parentElement.querySelectorAll("button");
    group.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
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
    row.innerHTML = `<span>${item.qty}x ${item.name}</span><strong>${formatCurrency(item.qty * item.price)}</strong>`;
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
let trackerChipVerified = false;
let signatureHasInk = false;
let isSigning = false;
let lastSignaturePoint = null;

function normalizeTrackerChip(value) {
  return value.replace(/\D/g, "");
}

function updateCompletionState() {
  const capturedPhotos = document.querySelectorAll(".photo-proof.captured").length;
  const hasSignature = signatureBox?.classList.contains("signed");
  const canFinish = capturedPhotos >= 3 && hasSignature && trackerChipVerified;

  if (finishOsButton) {
    finishOsButton.disabled = !canFinish;
  }

  if (completionStatus) {
    if (canFinish) {
      completionStatus.textContent = "Liberado";
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
