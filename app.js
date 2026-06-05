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
    refreshDropzones();
  });
});

const photoProofs = document.querySelectorAll(".photo-proof");
const capturePhotoButton = document.querySelector(".capture-photo-button");
const signatureBox = document.querySelector(".signature-box");
const finishOsButton = document.querySelector(".finish-os-button");
const completionStatus = document.querySelector(".completion-status");

function updateCompletionState() {
  const capturedPhotos = document.querySelectorAll(".photo-proof.captured").length;
  const hasSignature = signatureBox?.classList.contains("signed");
  const canFinish = capturedPhotos >= 3 && hasSignature;

  if (finishOsButton) {
    finishOsButton.disabled = !canFinish;
  }

  if (completionStatus) {
    completionStatus.textContent = canFinish ? "Liberado" : `${capturedPhotos}/3 fotos`;
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

if (signatureBox) {
  signatureBox.addEventListener("click", () => {
    signatureBox.classList.add("signed");
    signatureBox.querySelector(".signature-line").textContent = "Cliente Alpha";
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
const technicianChips = document.querySelectorAll(".technician-chip");
const selectedTechName = document.querySelector(".selected-tech-name");
const selectedTechStatus = document.querySelector(".selected-tech-status");
const selectedTechTeam = document.querySelector(".selected-tech-team");
const teamRedirectSelect = document.querySelector(".team-redirect-select");
const redirectTechButton = document.querySelector(".redirect-tech-button");

teamStatusCards.forEach((card) => {
  card.addEventListener("click", () => {
    teamStatusCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");

    if (selectedTeamTitle && selectedTeamCopy) {
      selectedTeamTitle.textContent = card.dataset.teamDetail;
      selectedTeamCopy.textContent = `${card.dataset.teamMembers} · ${card.dataset.teamState} · ${card.dataset.teamOs}`;
    }
  });
});

technicianChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    technicianChips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");

    if (selectedTechName && selectedTechStatus && selectedTechTeam && teamRedirectSelect) {
      selectedTechName.textContent = chip.dataset.name;
      selectedTechStatus.textContent = chip.dataset.status;
      selectedTechTeam.textContent = chip.dataset.team;
      teamRedirectSelect.value = chip.dataset.team;
    }
  });
});

if (redirectTechButton) {
  redirectTechButton.addEventListener("click", () => {
    const activeTech = document.querySelector(".technician-chip.active");
    if (!activeTech || !selectedTechTeam || !selectedTechStatus) return;

    activeTech.dataset.team = teamRedirectSelect.value;
    activeTech.dataset.status = "Redirecionado";
    selectedTechTeam.textContent = teamRedirectSelect.value;
    selectedTechStatus.textContent = "Redirecionado";
    redirectTechButton.textContent = "Tecnico redirecionado";

    window.setTimeout(() => {
      redirectTechButton.textContent = "Redirecionar tecnico";
    }, 1200);
  });
}

refreshDropzones();
updateCompletionState();
