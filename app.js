const navButtons = document.querySelectorAll(".nav-list button, .mobile-tabs button, .bottom-nav button");
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("mobile") === "1" || urlParams.get("view") === "mobile") {
  document.body.classList.add("force-mobile");
}

const roleSelect = document.querySelector(".role-select");
const teamAccessSelects = document.querySelectorAll(".team-access-select");
const financeNavButton = document.querySelector('.nav-list button[data-admin-only="true"]');
const teamLoginButtons = document.querySelectorAll(".team-login-button");
const teamLoginDialog = document.querySelector(".team-login-dialog");
const teamLoginForm = document.querySelector(".team-login-form");
const loginTeamSelect = document.querySelector(".login-team-select");
const loginUserInput = document.querySelector(".login-user-input");
const loginPasswordInput = document.querySelector(".login-password-input");
const teamLoginHint = document.querySelector(".team-login-hint");
const teamLoginStatus = document.querySelector(".team-login-status");
const activeAccountLabel = document.querySelector(".active-account-label");
const teamAccountList = document.querySelector(".team-account-list");
const trackingMarkerLayers = document.querySelectorAll(".tracking-marker-layer");
const trackingTeamLists = document.querySelectorAll(".tracking-team-list");
const trackingVisibleCount = document.querySelector(".tracking-visible-count");
const trackingUpdatedLabels = document.querySelectorAll(".tracking-updated-at");
const refreshTrackingButtons = document.querySelectorAll(".refresh-tracking-button");
const metricsGrid = document.querySelector(".metrics-grid");
const workspacePanels = document.querySelectorAll(".workspace-grid > article");
const pageContext = document.querySelector(".topbar p");
const pageTitle = document.querySelector(".topbar h1");
const sidebarSummaryTitle = document.querySelector(".sidebar-summary strong");
const sidebarSummaryDetail = document.querySelector(".sidebar-summary small");
const storageKey = "controle-os-local-v2";
const defaultTeamAccounts = [
  { team: "Equipe 1", user: "equipe1", password: "equipe1", members: "Bruno e Leo" },
  { team: "Equipe 2", user: "equipe2", password: "equipe2", members: "Ana e Rui" },
  { team: "Equipe 3", user: "equipe3", password: "equipe3", members: "Marcos e Bia" },
  { team: "Equipe 4", user: "equipe4", password: "equipe4", members: "Diego e Caio" },
  { team: "Equipe 5", user: "equipe5", password: "equipe5", members: "Plantao" }
];

const buttonIconMap = {
  painel: "layout-dashboard",
  agenda: "calendar-days",
  ordens: "clipboard-list",
  estoque: "package",
  clientes: "users",
  equipe: "user-cog",
  rastreamento: "map-pin",
  localizacao: "map-pin",
  financeiro: "dollar-sign",
  valores: "dollar-sign",
  relatorios: "bar-chart-3",
  os: "clipboard-list",
  perfil: "user",
  exportar: "download",
  "conta equipe": "log-in",
  "nova os": "plus-circle",
  hoje: "calendar-check",
  semana: "calendar-range",
  mes: "calendar-days",
  "ver todas": "list",
  "ler camera": "scan-line",
  "abrir produto": "search",
  "cadastrar e gerar qr": "qr-code",
  "imprimir etiqueta": "printer",
  "registrar entrada": "arrow-down-to-line",
  "registrar saida": "arrow-up-from-line",
  equipes: "users",
  "instrucao os": "clipboard-pen",
  detalhar: "search",
  "entrar como equipe": "log-in",
  "abrir cadastro": "folder-open",
  "atualizar posicoes": "refresh-cw",
  atualizar: "refresh-cw",
  mapa: "map",
  novo: "plus",
  "salvar tecnico": "save",
  excluir: "trash-2",
  conta: "log-in",
  "iniciar rota": "route",
  agora: "clock",
  proximas: "calendar-plus",
  concluidas: "check-circle-2",
  ligar: "phone",
  rota: "map",
  whatsapp: "message-circle",
  "iniciar atendimento": "play",
  "solicitar material": "package-plus",
  "salvar observacao": "save",
  "adicionar foto restante": "camera",
  limpar: "eraser",
  "confirmar assinatura": "pen-line",
  "contabilizar id chip": "badge-check",
  "confirmar id do chip": "badge-check",
  "concluir os": "check-circle-2",
  "scanner qr os": "qr-code",
  sincronizar: "refresh-cw",
  "chat supervisor": "message-square",
  auditoria: "shield-check",
  "historico de acoes": "shield-check",
  "abrir os": "external-link",
  "enviar mensagem": "send",
  cancelar: "x",
  "adicionar os": "plus-circle",
  proximo: "arrow-right",
  voltar: "arrow-left",
  "agendar mes": "calendar-plus",
  "agendar os": "calendar-plus",
  entrar: "log-in"
};

const iconOnlyMap = {
  Pesquisar: "search",
  Menu: "menu",
  Fechar: "x"
};

const roleViewCopy = {
  admin: {
    context: "Gestao geral",
    title: "Visao do dia",
    summary: "Visao completa da operacao",
    detail: "Agenda, estoque, equipes e relatorios"
  },
  atendimento: {
    context: "Atendimento",
    title: "Agenda e OS",
    summary: "Equipes e OS em foco",
    detail: "Agenda, clientes, rotas e relatorios"
  },
  estoque: {
    context: "Almoxarifado",
    title: "Estoque",
    summary: "Controle de materiais",
    detail: "Entradas, saidas, QR Code e alertas"
  },
  tecnico: {
    context: "Tecnico",
    title: "Minhas OS",
    summary: "OS da equipe logada",
    detail: "Atendimentos, fotos, assinatura e ID do chip"
  }
};

function updateRoleCopy(role) {
  const copy = roleViewCopy[role] || roleViewCopy.admin;
  if (pageContext) pageContext.textContent = copy.context;
  if (pageTitle) pageTitle.textContent = copy.title;
  if (sidebarSummaryTitle) sidebarSummaryTitle.textContent = copy.summary;
  if (sidebarSummaryDetail) sidebarSummaryDetail.textContent = copy.detail;
}

function normalizeButtonLabel(button) {
  return button.textContent.trim().replace(/\s+/g, " ").toLowerCase();
}

function attachIcon(button, iconName) {
  if (!button || !iconName || button.querySelector(".button-icon")) return;

  const icon = document.createElement("i");
  icon.className = "button-icon";
  icon.setAttribute("data-lucide", iconName);
  icon.setAttribute("aria-hidden", "true");

  if (button.classList.contains("icon-button")) {
    button.textContent = "";
    button.appendChild(icon);
  } else {
    button.prepend(icon);
  }

  button.classList.add("has-icon");

  if (button.classList.contains("icon-button") && button.getAttribute("aria-label")) {
    button.title = button.getAttribute("aria-label");
  }
}

function decorateButtonIcons() {
  document.querySelectorAll("button, a.secondary-button, a.primary-button, a.ghost-button").forEach((button) => {
    const ariaLabel = button.getAttribute("aria-label");
    attachIcon(button, iconOnlyMap[ariaLabel] || buttonIconMap[normalizeButtonLabel(button)]);
  });

  if (window.lucide?.createIcons) {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 2.2
      }
    });
  }
}

decorateButtonIcons();

function loadLocalState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

let localState = loadLocalState();
let teamAccounts = localState.teamAccounts || defaultTeamAccounts;
let appliedRole = "";
let appliedTeam = "";

function saveLocalState() {
  localStorage.setItem(storageKey, JSON.stringify(localState));
}

function updateLocalState(key, value) {
  localState[key] = value;
  saveLocalState();
}

function getNowLabel() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function addAudit(action, detail) {
  const entry = { action, detail, when: getNowLabel(), role: roleSelect?.value || "admin" };
  localState.auditLog = [entry, ...(localState.auditLog || [])].slice(0, 80);
  saveLocalState();
  renderAuditLog?.();
}

function queueOfflineAction(type, detail) {
  const entry = { type, detail, when: getNowLabel(), synced: navigator.onLine };
  localState.syncQueue = [entry, ...(localState.syncQueue || [])].slice(0, 60);
  saveLocalState();
  renderSyncStatus?.();
}

function notifyLocal(message) {
  const notificationStatus = document.querySelector(".notification-status");
  if (notificationStatus) notificationStatus.textContent = message;

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Controle OS", { body: message });
  }
}

function setUserRole(role) {
  if (role === "vendedor") role = "atendimento";
  const isAdmin = role === "admin";
  const canUseTracking = role === "admin" || role === "atendimento";
  appliedRole = role;
  document.body.classList.remove("role-admin", "role-estoque", "role-tecnico", "role-vendedor", "role-atendimento");
  document.body.classList.add(`role-${role}`);
  document.body.classList.toggle("is-admin", isAdmin);
  updateRoleCopy(role);

  if (!isAdmin && document.body.classList.contains("finance-visible")) {
    document.body.classList.remove("finance-visible");
    financeNavButton?.classList.remove("active");
    document.querySelector(".nav-list button:not([data-admin-only])")?.classList.add("active");
  }

  if (!canAccessStock() && document.querySelector(".stock-only.active")) {
    showDesktopSection?.("painel", false);
  }

  if (role === "atendimento") {
    document.body.classList.remove("finance-visible");
    if (document.querySelector(".stock-only.active, [data-admin-only].active")) {
      showDesktopSection?.("painel", false);
    }
  }

  if (!canUseTracking && document.querySelector(".tracking-only.active")) {
    showDesktopSection?.("painel", false);
  }

  if (!canAccessClientArea() && document.querySelector(".client-access-only.active")) {
    showDesktopSection?.("painel", false);
  }
}

const savedRole = (localState.role === "vendedor" ? "atendimento" : localState.role) || roleSelect?.value || "admin";
  if (roleSelect) roleSelect.value = savedRole;
setUserRole(savedRole);

function getActiveTeam() {
  return localState.activeTeam || teamAccessSelects[0]?.value || "Equipe 1";
}

function setActiveTeam(team, shouldRender = true) {
  appliedTeam = team;
  teamAccessSelects.forEach((select) => {
    select.value = team;
  });
  updateLocalState("activeTeam", team);

  if (shouldRender) {
    renderOrderQueue?.();
    renderDispatchBoard?.();
    renderMobileOrders?.();
    renderTeamReport?.();
    renderMonthlySchedule?.();
    renderMonthCalendar?.();
    renderTracking?.();
  }
}

setActiveTeam(localState.activeTeam || "Equipe 1", false);

function getTeamAccount(team) {
  return teamAccounts.find((account) => account.team === team) || teamAccounts[0];
}

function renderActiveAccount() {
  const activeAccount = localState.activeTeamAccount;
  if (!activeAccountLabel) return;

  if (activeAccount) {
    activeAccountLabel.textContent = `${activeAccount.team} logada`;
    return;
  }

  if (roleSelect?.value === "admin") {
    activeAccountLabel.textContent = "Administrador";
  } else if (roleSelect?.value === "atendimento") {
    activeAccountLabel.textContent = "Atendimento";
  } else {
    activeAccountLabel.textContent = "Sem conta de equipe";
  }
}

function fillTeamLogin(team = getActiveTeam()) {
  const account = getTeamAccount(team);
  if (!account) return;

  if (loginTeamSelect) loginTeamSelect.value = account.team;
  if (loginUserInput) loginUserInput.value = account.user;
  if (loginPasswordInput) loginPasswordInput.value = "";
  if (teamLoginHint) teamLoginHint.textContent = `${account.team}: usuario ${account.user}, senha ${account.password}`;
  if (teamLoginStatus) teamLoginStatus.textContent = "Ao entrar, a equipe visualiza apenas as proprias OS.";
}

function renderTeamAccounts() {
  if (!teamAccountList) return;

  teamAccountList.innerHTML = teamAccounts.map((account) => `
    <article class="team-account-card">
      <strong>${account.team}</strong>
      <span>Usuario: ${account.user}</span>
      <small>Senha inicial: ${account.password}</small>
      <small>${account.members}</small>
    </article>
  `).join("");
}

function loginTeamAccount(account) {
  localState.activeTeamAccount = {
    team: account.team,
    user: account.user,
    members: account.members
  };
  saveLocalState();

  if (roleSelect) roleSelect.value = "tecnico";
  setUserRole("tecnico");
  setActiveTeam(account.team);
  updateLocalState("role", "tecnico");
  addAudit("Conta de equipe acessada", `${account.team} entrou como ${account.user}`);
  renderActiveAccount();
  renderMaterialRequests?.();
  notifyLocal(`${account.team} conectada.`);
}

teamAccessSelects.forEach((select) => {
  select.addEventListener("change", () => {
    setActiveTeam(select.value);
    if (localState.activeTeamAccount) {
      localState.activeTeamAccount.team = select.value;
      localState.activeTeamAccount.user = getTeamAccount(select.value)?.user || localState.activeTeamAccount.user;
      saveLocalState();
      renderActiveAccount();
    }
    addAudit("Equipe do tecnico alterada", select.value);
  });
});

teamLoginButtons.forEach((button) => {
  button.addEventListener("click", () => {
    fillTeamLogin(getActiveTeam());
    teamLoginDialog?.showModal();
  });
});

document.querySelectorAll(".close-team-login").forEach((button) => {
  button.addEventListener("click", () => teamLoginDialog?.close());
});

loginTeamSelect?.addEventListener("change", () => {
  fillTeamLogin(loginTeamSelect.value);
});

teamLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = getTeamAccount(loginTeamSelect?.value);
  const user = loginUserInput?.value.trim().toLowerCase();
  const password = loginPasswordInput?.value || "";

  if (!account || user !== account.user || password !== account.password) {
    if (teamLoginStatus) teamLoginStatus.textContent = "Usuario ou senha da equipe incorretos.";
    addAudit("Tentativa de acesso negada", loginTeamSelect?.value || "Equipe nao informada");
    return;
  }

  loginTeamAccount(account);
  teamLoginDialog?.close();
});

function refreshAccessControls() {
  const role = roleSelect?.value || appliedRole;
  const team = teamAccessSelects[0]?.value || appliedTeam;

  if (role && role !== appliedRole) {
    setUserRole(role);
    updateLocalState("role", role);
    if (!canAccessSection(getActiveDesktopSection())) {
      showDesktopSection(getDefaultDesktopSection(role), false);
    }
    renderMaterialRequests?.();
    renderOrderQueue?.();
    renderDispatchBoard?.();
    renderMobileOrders?.();
    renderTeamReport?.();
    renderMonthlySchedule?.();
    renderMonthCalendar?.();
    renderTracking?.();
  }

  if (team && team !== appliedTeam) {
    setActiveTeam(team);
  }
}

window.applyAccessFromForm = refreshAccessControls;
window.setInterval(refreshAccessControls, 300);

if (roleSelect) {
  roleSelect.addEventListener("change", () => {
    setUserRole(roleSelect.value);
    updateLocalState("role", roleSelect.value);
    if (roleSelect.value !== "tecnico") {
      delete localState.activeTeamAccount;
      saveLocalState();
    }
    addAudit("Perfil alterado", `Perfil ativo: ${roleSelect.value}`);
    if (!canAccessSection(getActiveDesktopSection())) {
      showDesktopSection(getDefaultDesktopSection(roleSelect.value), false);
    }
    renderActiveAccount();
    renderMaterialRequests?.();
    renderOrderQueue?.();
    renderDispatchBoard?.();
    renderMobileOrders?.();
    renderTeamReport?.();
    renderMonthlySchedule?.();
    renderMonthCalendar?.();
    renderTracking?.();
  });
}

const desktopSections = {
  painel: [".calendar-panel", ".orders-panel"],
  agenda: [".calendar-panel"],
  ordens: [".orders-panel"],
  estoque: [".stock-panel"],
  clientes: [".client-history-panel"],
  equipe: [".team-panel", ".profiles-panel"],
  rastreamento: [".tracking-panel"],
  financeiro: [".finance-panel"],
  relatorios: [".reports-panel"]
};

function getDesktopSectionKey(button) {
  const key = button.textContent.trim().toLowerCase();
  const aliases = {
    localizacao: "rastreamento",
    valores: "financeiro"
  };
  return aliases[key] || key;
}

function canAccessTracking() {
  const role = roleSelect?.value || appliedRole || "admin";
  return role === "admin" || role === "atendimento";
}

function canAccessClientArea() {
  const role = roleSelect?.value || appliedRole || "admin";
  return role === "admin" || role === "atendimento";
}

function canAccessStock() {
  const role = roleSelect?.value || appliedRole || "admin";
  return role === "admin" || role === "estoque" || role === "tecnico";
}

function canAccessReports() {
  const role = roleSelect?.value || appliedRole || "admin";
  return role === "admin" || role === "atendimento";
}

function canAccessTeamManagement() {
  const role = roleSelect?.value || appliedRole || "admin";
  return role === "admin" || role === "atendimento";
}

function getDefaultDesktopSection(role = roleSelect?.value || appliedRole || "admin") {
  if (role === "estoque") return "estoque";
  return "painel";
}

function canAccessSection(sectionKey) {
  const role = roleSelect?.value || appliedRole || "admin";
  if (["painel", "agenda", "ordens"].includes(sectionKey)) return role !== "estoque";
  if (sectionKey === "estoque") return canAccessStock();
  if (sectionKey === "clientes") return canAccessClientArea();
  if (sectionKey === "equipe") return canAccessTeamManagement();
  if (sectionKey === "rastreamento") return canAccessTracking();
  if (sectionKey === "financeiro") return role === "admin";
  if (sectionKey === "relatorios") return canAccessReports();
  return true;
}

function getActiveDesktopSection() {
  const activeButton = document.querySelector(".nav-list button.active");
  return activeButton ? getDesktopSectionKey(activeButton) : getDefaultDesktopSection();
}

function setActiveDesktopNav(sectionKey) {
  document.querySelectorAll(".nav-list button").forEach((item) => {
    item.classList.toggle("active", getDesktopSectionKey(item) === sectionKey);
  });
}

function showDesktopSection(sectionKey, shouldScroll = true) {
  if (!canAccessSection(sectionKey)) {
    sectionKey = getDefaultDesktopSection();
  }

  const selectors = desktopSections[sectionKey] || desktopSections.painel;

  if (metricsGrid) {
    metricsGrid.hidden = sectionKey !== "painel";
  }

  workspacePanels.forEach((panel) => {
    panel.hidden = !selectors.some((selector) => panel.matches(selector));
  });

  document.body.classList.toggle("finance-visible", sectionKey === "financeiro");
  setActiveDesktopNav(sectionKey);

  if (!shouldScroll) return;

  if (sectionKey === "painel") {
    metricsGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  document.querySelector(selectors[0])?.scrollIntoView({ behavior: "smooth", block: "start" });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.adminOnly === "true" && !document.body.classList.contains("is-admin")) return;

    if (button.closest(".nav-list")) {
      const sectionKey = getDesktopSectionKey(button);
      if (!canAccessSection(sectionKey)) return;
      showDesktopSection(sectionKey);
    } else if (button.closest(".bottom-nav") && button.textContent.trim().toLowerCase() === "rota") {
      if (!canAccessTracking()) return;
      const group = button.parentElement.querySelectorAll("button");
      group.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(".mobile-tracking-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (button.closest(".bottom-nav") && button.classList.contains("stock-only") && !canAccessStock()) {
      return;
    } else {
      const group = button.parentElement.querySelectorAll("button");
      group.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    }
  });
});

showDesktopSection(getDefaultDesktopSection(savedRole), false);

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
const materialRequestList = document.querySelector(".material-request-list");
const materialPendingCount = document.querySelector(".material-pending-count");
let selectedProducts = localState.selectedProducts || [{ name: "Fonte 12V 2A", qty: 1, price: 48 }];
let materialRequests = localState.materialRequests || [];

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
  updateLocalState("selectedProducts", selectedProducts);
}

function renderMaterialRequests() {
  if (!materialRequestList || !materialPendingCount) return;

  const pending = materialRequests.filter((request) => request.status === "pendente");
  materialPendingCount.textContent = `${pending.length} pendente${pending.length === 1 ? "" : "s"}`;

  if (materialRequests.length === 0) {
    materialRequestList.innerHTML = "<small>Nenhuma solicitacao pendente.</small>";
    return;
  }

  materialRequestList.innerHTML = materialRequests.map((request) => {
    const canApprove = ["admin", "estoque"].includes(roleSelect?.value || "admin") && request.status === "pendente";
    return `
      <article class="material-request-item" data-request-id="${request.id}">
        <strong>${request.qty}x ${request.name}</strong>
        <small>${request.os} - ${request.status} - ${request.when}</small>
        ${canApprove ? `
          <div class="material-request-actions">
            <button class="secondary-button approve-material-button" type="button" data-request-id="${request.id}">Aprovar</button>
            <button class="danger-button reject-material-button" type="button" data-request-id="${request.id}">Reprovar</button>
          </div>
        ` : ""}
      </article>
    `;
  }).join("");
}

function createMaterialRequest(item) {
  const request = {
    id: Date.now(),
    os: "OS-1048",
    name: item.name,
    qty: item.qty,
    status: "pendente",
    when: getNowLabel()
  };
  materialRequests.unshift(request);
  updateLocalState("materialRequests", materialRequests);
  addAudit("Material solicitado", `${request.qty}x ${request.name} para ${request.os}`);
  queueOfflineAction("material", `${request.qty}x ${request.name}`);
  notifyLocal(`Material solicitado: ${request.name}`);
  renderMaterialRequests();
}

function updateMaterialRequest(id, status) {
  const request = materialRequests.find((item) => item.id === Number(id));
  if (!request) return;

  request.status = status;
  request.reviewedAt = getNowLabel();
  updateLocalState("materialRequests", materialRequests);
  addAudit(`Material ${status}`, `${request.qty}x ${request.name} em ${request.os}`);
  queueOfflineAction("material-review", `${request.name}: ${status}`);
  notifyLocal(`Solicitacao de material ${status}.`);
  renderMaterialRequests();
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
    const requestItem = {
      name: selectedCard.dataset.product,
      qty,
      price: parseCurrency(selectedCard.dataset.price)
    };

    selectedProducts.push(requestItem);
    createMaterialRequest(requestItem);

    productQty.value = "1";
    addProductButton.textContent = "Solicitacao criada";
    renderClientProducts();

    window.setTimeout(() => {
      addProductButton.textContent = "Solicitar material";
    }, 1200);
  });
}

renderClientProducts();
renderMaterialRequests();

if (materialRequestList) {
  materialRequestList.addEventListener("click", (event) => {
    const approveButton = event.target.closest(".approve-material-button");
    const rejectButton = event.target.closest(".reject-material-button");
    if (approveButton) updateMaterialRequest(approveButton.dataset.requestId, "aprovado");
    if (rejectButton) updateMaterialRequest(rejectButton.dataset.requestId, "reprovado");
  });
}

const defaultInventoryProducts = [
  { id: 1, name: "Fonte 12V 2A", sku: "FON-12V-2A", category: "Eletrica", location: "Prateleira A1", qty: 8, min: 20, cost: 29, price: 48, qr: "PROD:FON-12V-2A" },
  { id: 2, name: "Bateria 7Ah", sku: "BAT-7AH", category: "Energia", location: "Prateleira A2", qty: 10, min: 12, cost: 62, price: 96, qr: "PROD:BAT-7AH" },
  { id: 3, name: "Cabo UTP Cat6", sku: "CAB-CAT6", category: "Rede", location: "Corredor B1", qty: 5, min: 6, cost: 270, price: 420, qr: "PROD:CAB-CAT6" },
  { id: 4, name: "Sensor magnetico", sku: "SEN-MAG", category: "Alarme", location: "Gaveta C3", qty: 42, min: 30, cost: 18, price: 32, qr: "PROD:SEN-MAG" },
  { id: 5, name: "Camera dome Full HD", sku: "CAM-DOME-FHD", category: "CFTV", location: "Armario D1", qty: 14, min: 8, cost: 128, price: 189, qr: "PROD:CAM-DOME-FHD" },
  { id: 6, name: "Controle remoto TX", sku: "CTRL-TX", category: "Automacao", location: "Gaveta C1", qty: 24, min: 15, cost: 34, price: 58, qr: "PROD:CTRL-TX" }
];

let inventoryProducts = localState.inventoryProducts || defaultInventoryProducts;

const defaultStockMovements = [
  { product: "Fonte 12V 2A", type: "saida", qty: 1, user: "Estoque", date: "Hoje 10:05", reason: "OS", before: 9, after: 8 },
  { product: "Bateria 7Ah", type: "entrada", qty: 4, user: "Estoque", date: "Hoje 08:20", reason: "Fornecedor B", before: 6, after: 10 }
];

let stockMovements = localState.stockMovements || defaultStockMovements;

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
    date: getNowLabel(),
    reason,
    before,
    after
  });
  selectedInventoryProductId = product.id;
  updateLocalState("inventoryProducts", inventoryProducts);
  updateLocalState("stockMovements", stockMovements);
  addAudit(type === "entrada" ? "Entrada de estoque" : "Saida de estoque", `${qty} un. de ${product.name} - ${reason}`);
  queueOfflineAction("estoque", `${type} ${qty} un. ${product.sku}`);
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
    updateLocalState("inventoryProducts", inventoryProducts);
    addAudit("Produto cadastrado", `${product.name} (${product.sku})`);
    queueOfflineAction("produto", product.sku);
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

const orderList = document.querySelector(".order-list");
const availableOrders = document.querySelector(".available-orders");
const newOsButton = document.querySelector(".new-os-button");
const newOsDialog = document.querySelector(".new-os-dialog");
const newOsForm = document.querySelector(".new-os-form");
const newOsStatusCopy = document.querySelector(".new-os-status-copy");
const newOsStepItems = newOsForm?.querySelectorAll(".new-os-steps span") || [];
const newOsStepFields = newOsForm?.querySelectorAll("[data-new-os-step]") || [];
const newOsPrevButton = document.querySelector(".new-os-prev-button");
const newOsNextButton = document.querySelector(".new-os-next-button");
const newOsSubmitButton = document.querySelector(".new-os-submit-button");
const monthlyScheduleButton = document.querySelector(".monthly-schedule-button");
const monthlyScheduleDialog = document.querySelector(".monthly-schedule-dialog");
const monthlyScheduleForm = document.querySelector(".monthly-schedule-form");
const monthlyScheduleList = document.querySelector(".monthly-schedule-list");
const monthlyScheduleTitle = document.querySelector(".monthly-schedule-title");
const monthlyScheduleStatus = document.querySelector(".monthly-schedule-status");
const monthCalendarGrid = document.querySelector(".month-calendar-grid");
const monthCalendarTitle = document.querySelector(".month-calendar-title");
const monthCalendarCount = document.querySelector(".month-calendar-count");
const teamReportBody = document.querySelector(".team-report-body");
const teamReportFilter = document.querySelector(".team-report-filter");
const completedTeamCount = document.querySelector(".completed-team-count");
const mobileOsList = document.querySelector(".mobile-os-list");
const teamCompletedBase = {
  "Equipe 1": 18,
  "Equipe 2": 14,
  "Equipe 3": 16,
  "Equipe 4": 11,
  "Equipe 5": 7
};
const teamReportMeta = {
  "Equipe 1": { time: "1h42", photos: "100%", signatures: "100%", status: "No padrao", pill: "teal" },
  "Equipe 2": { time: "2h05", photos: "96%", signatures: "93%", status: "Acompanhar", pill: "amber" },
  "Equipe 3": { time: "1h58", photos: "98%", signatures: "100%", status: "No padrao", pill: "teal" },
  "Equipe 4": { time: "2h26", photos: "91%", signatures: "88%", status: "Revisar", pill: "amber" },
  "Equipe 5": { time: "1h35", photos: "100%", signatures: "100%", status: "Plantao ok", pill: "teal" }
};
const defaultServiceOrders = [
  { code: "OS-1048", client: "Cliente Alpha Condominio", description: "Portao automatico sem resposta - 2 produtos no cliente", tech: "Bruno", time: "09:30", team: "Equipe 1", priority: "high", status: "pending" },
  { code: "OS-1049", client: "Mercado Central", description: "Preventiva em cameras CFTV", tech: "Marcos", time: "11:00", team: "Equipe 3", priority: "normal", status: "pending" },
  { code: "OS-1050", client: "Clinica Santa Clara", description: "Troca de fonte e bateria", tech: "Ana", time: "14:00", team: "Equipe 2", priority: "warning", status: "pending" },
  { code: "OS-1051", client: "Residencial Norte", description: "Instalacao de leitor facial", tech: "Diego", time: "16:30", team: "Equipe 4", priority: "normal", status: "pending" }
];

let serviceOrders = localState.serviceOrders || defaultServiceOrders;

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentDateValue() {
  const now = new Date();
  return `${getCurrentMonthValue()}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatDateShort(dateValue) {
  if (!dateValue) return "Sem data";
  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) return dateValue;
  return `${day}/${month}`;
}

function getMonthLabel(monthValue) {
  if (!monthValue) return "mes atual";
  const [year, month] = monthValue.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return monthValue;
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function getOrderCalendarDate(order) {
  if (order.scheduledDate) return order.scheduledDate;
  const fallbackDays = {
    "OS-1048": "05",
    "OS-1049": "05",
    "OS-1050": "05",
    "OS-1051": "07",
    "OS-1052": "06",
    "OS-1053": "09",
    "OS-1054": "12",
    "OS-1055": "18"
  };
  const day = fallbackDays[order.code];
  return day ? `${getCurrentMonthValue()}-${day}` : "";
}

function canSeeAllOrders() {
  return (roleSelect?.value || "admin") !== "tecnico";
}

function getVisibleServiceOrders() {
  if (canSeeAllOrders()) return serviceOrders;
  const activeTeam = getActiveTeam();
  return serviceOrders.filter((order) => order.team === activeTeam);
}

function getOrderLabel(order) {
  if (order.status === "completed") return { text: "Concluida", pill: "teal" };
  if (order.priority === "high") return { text: "Alta", pill: "red" };
  if (order.priority === "warning") return { text: "Pendente", pill: "amber" };
  return { text: "Agenda", pill: "teal" };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getOrderClass(order) {
  if (order.status === "completed") return "completed";
  if (order.priority === "high") return "high";
  if (order.priority === "warning") return "warning";
  return "";
}

function createDispatchCard(order) {
  const card = document.createElement("article");
  card.className = `dispatch-card ${getOrderClass(order)}`.trim();
  card.draggable = true;
  card.dataset.osCode = order.code;
  card.innerHTML = `
    <strong>${escapeHtml(order.code)}</strong>
    <span>${escapeHtml(order.client.replace(/^Cliente\s+/, ""))}</span>
    <small>${order.scheduledDate ? `${formatDateShort(order.scheduledDate)} - ` : ""}${order.time} - ${order.status === "completed" ? "concluida" : "agendada"}</small>
  `;
  bindDispatchCard(card);
  return card;
}

function upsertDispatchCard(order) {
  document.querySelector(`.dispatch-card[data-os-code="${order.code}"]`)?.remove();
  const card = createDispatchCard(order);

  if (order.team && order.team !== "Sem equipe") {
    const zone = document.querySelector(`.team-column[data-team="${order.team}"] .team-dropzone`);
    zone?.querySelector(".empty-placeholder")?.remove();
    zone?.appendChild(card);
  } else if (availableOrders) {
    availableOrders.appendChild(card);
  }

  refreshDropzones();
  sortServiceOrdersByPriority();
}

function renderDispatchBoard() {
  availableOrders?.querySelectorAll(".dispatch-card").forEach((card) => card.remove());
  document.querySelectorAll(".team-dropzone .dispatch-card").forEach((card) => card.remove());

  const activeTeam = getActiveTeam();
  const technicianView = !canSeeAllOrders();
  document.querySelectorAll(".team-column").forEach((column) => {
    column.hidden = technicianView && column.dataset.team !== activeTeam;
  });
  if (availableOrders) {
    availableOrders.hidden = technicianView;
  }

  getVisibleServiceOrders().forEach(upsertDispatchCard);
  refreshDropzones();
}

function renderOrderQueue() {
  if (!orderList) return;

  orderList.innerHTML = "";
  getVisibleServiceOrders()
    .slice()
    .sort((a, b) => getPriorityRank({ classList: { contains: (className) => getOrderClass(a) === className } }) - getPriorityRank({ classList: { contains: (className) => getOrderClass(b) === className } }) || getScheduleTime({ textContent: a.time }) - getScheduleTime({ textContent: b.time }))
    .forEach((order) => {
      const row = document.createElement("article");
      row.className = `order-row ${getOrderClass(order)}`.trim();
      row.dataset.osCode = order.code;
      row.innerHTML = `
        <div class="order-code">${escapeHtml(order.code)}</div>
        <div>
          <strong>${escapeHtml(order.client)}</strong>
          <span>${escapeHtml(order.description)}</span>
        </div>
        <small>${escapeHtml(order.tech || order.team || "Sem tecnico")} - ${order.time}</small>
      `;
      orderList.appendChild(row);
    });
}

function renderMobileOrders() {
  if (!mobileOsList) return;

  const orders = getVisibleServiceOrders()
    .slice()
    .sort((a, b) => getPriorityRank({ classList: { contains: (className) => getOrderClass(a) === className } }) - getPriorityRank({ classList: { contains: (className) => getOrderClass(b) === className } }) || getScheduleTime({ textContent: a.time }) - getScheduleTime({ textContent: b.time }));

  if (orders.length === 0) {
    mobileOsList.innerHTML = `
      <article class="mobile-os-empty">
        <strong>Nenhuma OS para ${escapeHtml(getActiveTeam())}</strong>
        <small>Quando uma OS for vinculada a esta equipe, ela aparece aqui.</small>
      </article>
    `;
    return;
  }

  mobileOsList.innerHTML = orders.map((order, index) => {
    const label = getOrderLabel(order);
    return `
      <button class="mobile-os-row${index === 0 ? " active" : ""}" type="button" data-os-code="${escapeHtml(order.code)}">
        <span class="pill ${label.pill}">${label.text}</span>
        <strong>${escapeHtml(order.code)}</strong>
        <small>${escapeHtml(order.client.replace(/^Cliente\s+/, ""))} - ${escapeHtml(order.team)} - ${order.time} - ${order.status === "completed" ? "Finalizada" : "Em aberto"}</small>
      </button>
    `;
  }).join("");
}

function renderTeamReport() {
  if (!teamReportBody) return;

  const selectedTeam = canSeeAllOrders() ? (teamReportFilter?.value || "all") : getActiveTeam();
  const teams = selectedTeam === "all" ? Object.keys(teamCompletedBase) : [selectedTeam];
  const rows = teams.map((team) => {
    const completedNow = serviceOrders.filter((order) => order.team === team && order.status === "completed").length;
    const total = (teamCompletedBase[team] || 0) + completedNow;
    const meta = teamReportMeta[team];
    return `
      <tr>
        <td>${team}</td>
        <td>${total}</td>
        <td>${meta.time}</td>
        <td>${meta.photos}</td>
        <td>${meta.signatures}</td>
        <td><span class="pill ${meta.pill}">${meta.status}</span></td>
      </tr>
    `;
  });

  teamReportBody.innerHTML = rows.join("");

  if (completedTeamCount) {
    const total = teams.reduce((sum, team) => {
      const completedNow = serviceOrders.filter((order) => order.team === team && order.status === "completed").length;
      return sum + (teamCompletedBase[team] || 0) + completedNow;
    }, 0);
    completedTeamCount.textContent = `${total} concluida${total === 1 ? "" : "s"}`;
  }
}

function renderMonthlySchedule() {
  if (!monthlyScheduleList) return;

  const monthValue = document.querySelector(".monthly-schedule-month")?.value || getCurrentMonthValue();
  const monthOrders = getVisibleServiceOrders()
    .filter((order) => (order.scheduledMonth || order.scheduledDate?.slice(0, 7)) === monthValue)
    .slice()
    .sort((a, b) => {
      const dateA = `${a.scheduledDate || ""}T${a.time || "00:00"}`;
      const dateB = `${b.scheduledDate || ""}T${b.time || "00:00"}`;
      return dateA.localeCompare(dateB);
    });

  if (monthlyScheduleTitle) {
    monthlyScheduleTitle.textContent = `OS agendadas de ${getMonthLabel(monthValue)}`;
  }

  if (monthOrders.length === 0) {
    monthlyScheduleList.innerHTML = `
      <article class="monthly-schedule-empty">
        <strong>Nenhuma OS agendada neste mes</strong>
        <small>Use Agendar mes para distribuir as OS nas equipes.</small>
      </article>
    `;
    return;
  }

  monthlyScheduleList.innerHTML = monthOrders.slice(0, 8).map((order) => {
    const label = getOrderLabel(order);
    return `
      <article class="monthly-schedule-row ${getOrderClass(order)}">
        <div class="monthly-schedule-date-badge">
          <strong>${escapeHtml(formatDateShort(order.scheduledDate))}</strong>
          <span>${escapeHtml(order.time || "--:--")}</span>
        </div>
        <div>
          <strong>${escapeHtml(order.code)} - ${escapeHtml(order.client.replace(/^Cliente\s+/, ""))}</strong>
          <span>${escapeHtml(order.description)}</span>
          <small>${escapeHtml(order.team || "Sem equipe")} - ${escapeHtml(order.tech || "Sem tecnico")}</small>
        </div>
        <span class="pill ${label.pill}">${label.text}</span>
      </article>
    `;
  }).join("");
}

function renderMonthCalendar() {
  if (!monthCalendarGrid) return;

  const monthValue = document.querySelector(".monthly-schedule-month")?.value || getCurrentMonthValue();
  const [yearText, monthText] = monthValue.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return;

  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const orders = getVisibleServiceOrders().filter((order) => getOrderCalendarDate(order).startsWith(monthValue));

  if (monthCalendarTitle) {
    monthCalendarTitle.textContent = getMonthLabel(monthValue);
  }

  if (monthCalendarCount) {
    monthCalendarCount.textContent = `${orders.length} OS`;
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const cells = weekDays.map((day) => `<div class="month-calendar-weekday">${day}</div>`);

  for (let i = 0; i < startOffset; i += 1) {
    cells.push('<div class="month-calendar-day muted" aria-hidden="true"></div>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateValue = `${monthValue}-${String(day).padStart(2, "0")}`;
    const dayOrders = orders.filter((order) => getOrderCalendarDate(order) === dateValue);
    const hasHigh = dayOrders.some((order) => order.priority === "high");
    const hasWarning = dayOrders.some((order) => order.priority === "warning");
    const tone = hasHigh ? "high" : hasWarning ? "warning" : dayOrders.length ? "busy" : "";
    const preview = dayOrders.slice(0, 2).map((order) => `
      <small>${escapeHtml(order.code)} ${escapeHtml(order.team || "")}</small>
    `).join("");

    cells.push(`
      <button class="month-calendar-day ${tone}" type="button" data-calendar-date="${dateValue}" aria-label="${dayOrders.length} OS em ${formatDateShort(dateValue)}">
        <strong>${day}</strong>
        ${dayOrders.length ? `<span>${dayOrders.length} OS</span>${preview}` : "<span>Livre</span>"}
      </button>
    `);
  }

  monthCalendarGrid.innerHTML = cells.join("");
}

function nextOrderCode() {
  const highest = serviceOrders.reduce((max, order) => {
    const number = Number(order.code.replace(/\D/g, ""));
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);
  return `OS-${highest + 1}`;
}

function addServiceOrder(order) {
  serviceOrders.push(order);
  updateLocalState("serviceOrders", serviceOrders);
  addAudit("OS criada", `${order.code} - ${order.client} - ${order.team}`);
  queueOfflineAction("os", `${order.code} criada`);
  notifyLocal(`Nova OS criada: ${order.code}`);
  renderOrderQueue();
  renderDispatchBoard();
  renderMobileOrders();
  renderTeamReport();
  renderMonthlySchedule();
  renderMonthCalendar();
  renderTracking?.();
}

teamReportFilter?.addEventListener("change", renderTeamReport);

let newOsStep = 1;
const newOsStepCopy = {
  1: "Etapa 1 de 4: informe o cliente.",
  2: "Etapa 2 de 4: descreva o servico e a prioridade.",
  3: "Etapa 3 de 4: escolha equipe, tecnico e horario.",
  4: "Etapa 4 de 4: revise e salve a OS."
};

function renderNewOsStep() {
  newOsStepFields.forEach((field) => {
    field.hidden = Number(field.dataset.newOsStep) !== newOsStep;
  });
  newOsStepItems.forEach((item, index) => {
    item.classList.toggle("active", index + 1 === newOsStep);
    item.classList.toggle("done", index + 1 < newOsStep);
  });
  if (newOsStatusCopy) newOsStatusCopy.textContent = newOsStepCopy[newOsStep];
  if (newOsPrevButton) newOsPrevButton.hidden = newOsStep === 1;
  if (newOsNextButton) newOsNextButton.hidden = newOsStep === 4;
  if (newOsSubmitButton) newOsSubmitButton.hidden = newOsStep !== 4;
}

function setNewOsStep(step) {
  newOsStep = Math.max(1, Math.min(4, step));
  renderNewOsStep();
}

function validateNewOsStep() {
  const requiredByStep = {
    1: [".new-os-client"],
    2: [".new-os-description"],
    3: [".new-os-time", ".new-os-team"]
  };
  const requiredFields = requiredByStep[newOsStep] || [];
  const emptyField = requiredFields
    .map((selector) => newOsForm?.querySelector(selector))
    .find((field) => field && !String(field.value || "").trim());

  if (!emptyField) return true;

  if (newOsStatusCopy) {
    newOsStatusCopy.textContent = "Preencha o campo desta etapa antes de continuar.";
  }
  emptyField.focus();
  return false;
}

newOsButton?.addEventListener("click", () => {
  const codeInput = document.querySelector(".new-os-code");
  if (codeInput && !codeInput.value.trim()) codeInput.value = nextOrderCode();
  setNewOsStep(1);
  newOsDialog?.showModal();
});

newOsPrevButton?.addEventListener("click", () => setNewOsStep(newOsStep - 1));
newOsNextButton?.addEventListener("click", () => {
  if (validateNewOsStep()) setNewOsStep(newOsStep + 1);
});

monthlyScheduleButton?.addEventListener("click", () => {
  const monthInput = document.querySelector(".monthly-schedule-month");
  const dateInput = document.querySelector(".monthly-schedule-date");
  const codeInput = document.querySelector(".monthly-schedule-code");
  const teamInput = document.querySelector(".monthly-schedule-team");

  if (monthInput && !monthInput.value) monthInput.value = getCurrentMonthValue();
  if (dateInput && !dateInput.value) dateInput.value = getCurrentDateValue();
  if (codeInput && !codeInput.value.trim()) codeInput.value = nextOrderCode();
  if (teamInput) teamInput.value = getActiveTeam();
  monthlyScheduleStatus.textContent = "Escolha a data, equipe e horario para agendar a OS.";
  monthlyScheduleDialog?.showModal();
});

document.querySelectorAll(".close-monthly-schedule").forEach((button) => {
  button.addEventListener("click", () => monthlyScheduleDialog?.close());
});

document.querySelector(".monthly-schedule-month")?.addEventListener("change", (event) => {
  const dateInput = document.querySelector(".monthly-schedule-date");
  if (dateInput && !dateInput.value.startsWith(event.target.value)) {
    dateInput.value = `${event.target.value}-01`;
  }
  renderMonthlySchedule();
  renderMonthCalendar();
});

document.querySelectorAll(".close-new-os").forEach((button) => {
  button.addEventListener("click", () => newOsDialog?.close());
});

monthlyScheduleForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const monthInput = document.querySelector(".monthly-schedule-month");
  const dateInput = document.querySelector(".monthly-schedule-date");
  const timeInput = document.querySelector(".monthly-schedule-time");
  const teamInput = document.querySelector(".monthly-schedule-team");
  const clientInput = document.querySelector(".monthly-schedule-client");
  const techInput = document.querySelector(".monthly-schedule-tech");
  const priorityInput = document.querySelector(".monthly-schedule-priority");
  const codeInput = document.querySelector(".monthly-schedule-code");
  const descriptionInput = document.querySelector(".monthly-schedule-description");
  const code = (codeInput.value.trim() || nextOrderCode()).toUpperCase();

  if (serviceOrders.some((order) => order.code === code)) {
    monthlyScheduleStatus.textContent = "Ja existe uma OS com esse numero.";
    return;
  }

  addServiceOrder({
    code,
    client: clientInput.value.trim(),
    description: descriptionInput.value.trim(),
    tech: techInput.value.trim(),
    time: timeInput.value,
    team: teamInput.value,
    priority: priorityInput.value,
    status: "scheduled",
    scheduledDate: dateInput.value,
    scheduledMonth: monthInput.value || dateInput.value.slice(0, 7)
  });

  monthlyScheduleStatus.textContent = `${code} agendada para ${formatDateShort(dateInput.value)}.`;
  monthlyScheduleForm.reset();
  monthInput.value = getCurrentMonthValue();
  dateInput.value = getCurrentDateValue();
  codeInput.value = nextOrderCode();
  monthlyScheduleDialog?.close();
});

newOsForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const codeInput = document.querySelector(".new-os-code");
  const clientInput = document.querySelector(".new-os-client");
  const descriptionInput = document.querySelector(".new-os-description");
  const timeInput = document.querySelector(".new-os-time");
  const teamInput = document.querySelector(".new-os-team");
  const priorityInput = document.querySelector(".new-os-priority");
  const statusInput = document.querySelector(".new-os-status");
  const techInput = document.querySelector(".new-os-tech");
  const code = (codeInput.value.trim() || nextOrderCode()).toUpperCase();

  if (serviceOrders.some((order) => order.code === code)) {
    newOsStatusCopy.textContent = "Ja existe uma OS com esse numero.";
    return;
  }

  addServiceOrder({
    code,
    client: clientInput.value.trim(),
    description: descriptionInput.value.trim(),
    tech: techInput.value.trim(),
    time: timeInput.value,
    team: teamInput.value,
    priority: priorityInput.value,
    status: statusInput.value
  });

  newOsStatusCopy.textContent = `${code} adicionada na fila.`;
  newOsForm.reset();
  codeInput.value = nextOrderCode();
  setNewOsStep(1);
  newOsDialog?.close();
});

const syncOfflineButton = document.querySelector(".sync-offline-button");
const offlineSyncStatus = document.querySelector(".offline-sync-status");
const scanOsQrButton = document.querySelector(".scan-os-qr-button");
const osQrCard = document.querySelector(".os-qr-card");
const osQrLabel = document.querySelector(".os-qr-label");
const osQrInput = document.querySelector(".os-qr-input");
const openOsByQrButton = document.querySelector(".open-os-by-qr-button");
const chatSupervisorButton = document.querySelector(".chat-supervisor-button");
const chatCard = document.querySelector(".chat-card");
const chatThread = document.querySelector(".chat-thread");
const chatInput = document.querySelector(".chat-input");
const sendChatButton = document.querySelector(".send-chat-button");
const auditButton = document.querySelector(".audit-button");
const auditCard = document.querySelector(".audit-card");
const auditLogList = document.querySelector(".audit-log-list");

function renderSyncStatus() {
  if (!offlineSyncStatus) return;

  const pending = (localState.syncQueue || []).filter((item) => !item.synced);
  offlineSyncStatus.textContent = pending.length > 0
    ? `${pending.length} acao${pending.length === 1 ? "" : "es"} aguardando sincronizacao`
    : "Fila local sincronizada";
}

function renderAuditLog() {
  if (!auditLogList) return;

  const logs = localState.auditLog || [];
  auditLogList.innerHTML = logs.length === 0
    ? "<small>Nenhuma acao registrada ainda.</small>"
    : logs.slice(0, 12).map((item) => `
      <article class="audit-log-item">
        <strong>${escapeHtml(item.action)}</strong>
        <small>${escapeHtml(item.detail)} - ${item.when} - ${item.role}</small>
      </article>
    `).join("");
}

function renderChatThread() {
  if (!chatThread) return;

  const messages = localState.chatMessages || [];
  chatThread.innerHTML = messages.length === 0
    ? "<small>Supervisor: envie uma mensagem curta sobre a OS.</small>"
    : messages.slice(-8).map((message) => `
      <article class="chat-message">
        <strong>${escapeHtml(message.author)}</strong>
        <small>${escapeHtml(message.text)} - ${message.when}</small>
      </article>
    `).join("");
}

function renderOsQr() {
  if (!osQrLabel) return;

  const currentCode = "OS-1048";
  osQrLabel.innerHTML = `
    <img class="qr-code-img" src="https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(currentCode)}" alt="QR Code ${currentCode}" />
    <div class="qr-fallback">${createQrMatrix(currentCode)}</div>
    <strong>${currentCode}</strong>
    <small>Abra rapidamente a ordem pelo celular</small>
  `;
}

syncOfflineButton?.addEventListener("click", () => {
  localState.syncQueue = (localState.syncQueue || []).map((item) => ({ ...item, synced: true }));
  saveLocalState();
  addAudit("Sincronizacao local", "Fila local marcada como sincronizada");
  renderSyncStatus();
  notifyLocal("Sincronizacao local concluida.");
});

scanOsQrButton?.addEventListener("click", async () => {
  osQrCard.hidden = !osQrCard.hidden;
  renderOsQr();
  osQrInput?.focus();
});

openOsByQrButton?.addEventListener("click", () => {
  const code = (osQrInput?.value || "").trim().toUpperCase();
  const found = serviceOrders.find((order) => order.code === code);
  addAudit("Scanner QR OS", found ? `${code} aberto localmente` : `${code || "vazio"} nao encontrado`);
  notifyLocal(found ? `${code} localizada.` : "OS nao encontrada no cache local.");
});

chatSupervisorButton?.addEventListener("click", () => {
  chatCard.hidden = !chatCard.hidden;
  renderChatThread();
  chatInput?.focus();
});

sendChatButton?.addEventListener("click", () => {
  const text = chatInput?.value.trim();
  if (!text) return;

  localState.chatMessages = [
    ...(localState.chatMessages || []),
    { author: roleSelect?.value || "tecnico", text, when: getNowLabel(), os: "OS-1048" }
  ].slice(-40);
  chatInput.value = "";
  saveLocalState();
  addAudit("Mensagem enviada", text);
  queueOfflineAction("chat", text);
  renderChatThread();
});

auditButton?.addEventListener("click", () => {
  auditCard.hidden = !auditCard.hidden;
  renderAuditLog();
});

window.addEventListener("online", renderSyncStatus);
window.addEventListener("offline", () => {
  addAudit("Modo offline", "Navegador informou ausencia de conexao");
  renderSyncStatus();
});

const photoProofs = document.querySelectorAll(".photo-proof");
const capturePhotoButton = document.querySelector(".capture-photo-button");
const photoUploadInput = document.querySelector(".photo-upload-input");
const signatureBox = document.querySelector(".signature-box");
const signatureCanvas = document.querySelector(".signature-canvas");
const signatureLine = document.querySelector(".signature-line");
const clearSignatureButton = document.querySelector(".clear-signature-button");
const confirmSignatureButton = document.querySelector(".confirm-signature-button");
const finishOsButton = document.querySelector(".finish-os-button");
const completionStatus = document.querySelector(".completion-status");
const completionRequirementItems = document.querySelectorAll("[data-requirement]");
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
let currentOsCompletionRegistered = false;
let targetPhotoProof = null;

function renderSavedPhotos() {
  const photos = localState.osPhotos || {};

  photoProofs.forEach((photo) => {
    const dataUrl = photos[photo.dataset.photo];
    photo.querySelector("img")?.remove();

    if (dataUrl) {
      const image = document.createElement("img");
      image.src = dataUrl;
      image.alt = `Foto ${photo.dataset.photo} da OS`;
      photo.appendChild(image);
      photo.classList.add("captured", "has-image");
    }
  });

  updateCompletionState();
}

function savePhotoProof(photo, dataUrl) {
  localState.osPhotos = {
    ...(localState.osPhotos || {}),
    [photo.dataset.photo]: dataUrl
  };
  saveLocalState();
  addAudit("Foto salva", `Foto ${photo.dataset.photo} vinculada a OS-1048`);
  queueOfflineAction("foto", `Foto ${photo.dataset.photo} da OS-1048`);
  renderSavedPhotos();
}

function normalizeTrackerChip(value) {
  return value.replace(/\D/g, "");
}

function updateCompletionState() {
  const capturedPhotos = document.querySelectorAll(".photo-proof.captured").length;
  const hasSignature = signatureBox?.classList.contains("signed");
  const canFinish = attendanceStarted && capturedPhotos >= 3 && hasSignature && trackerChipVerified;
  const requirementState = {
    checkin: attendanceStarted,
    photos: capturedPhotos >= 3,
    signature: hasSignature,
    chip: trackerChipVerified
  };

  if (finishOsButton) {
    finishOsButton.disabled = !canFinish;
  }

  completionRequirementItems.forEach((item) => {
    const done = Boolean(requirementState[item.dataset.requirement]);
    item.classList.toggle("done", done);
    item.classList.toggle("pending", !done);
  });

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
      completionStatus.textContent = "ID do chip pendente";
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

    addAudit("Check-in registrado", `Atendimento iniciado as ${time}`);
    queueOfflineAction("check-in", `OS-1048 as ${time}`);
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
    localState.serviceNotes = [
      { os: "OS-1048", text, when: getNowLabel() },
      ...(localState.serviceNotes || [])
    ].slice(0, 20);
    saveLocalState();
    addAudit("Observacao tecnica", text);
    queueOfflineAction("observacao", text);
  });
}

photoProofs.forEach((photo) => {
  photo.addEventListener("click", () => {
    targetPhotoProof = photo;
    photoUploadInput?.click();

    if (!photoUploadInput) {
      photo.classList.add("captured");
      updateCompletionState();
    }
  });
});

if (capturePhotoButton) {
  capturePhotoButton.addEventListener("click", () => {
    const nextPhoto = document.querySelector(".photo-proof:not(.captured)");
    if (nextPhoto) {
      targetPhotoProof = nextPhoto;
      photoUploadInput?.click();
      if (!photoUploadInput) nextPhoto.classList.add("captured");
    }
    updateCompletionState();
  });
}

if (photoUploadInput) {
  photoUploadInput.addEventListener("change", () => {
    const file = photoUploadInput.files?.[0];
    const target = targetPhotoProof || document.querySelector(".photo-proof:not(.captured)");
    if (!file || !target) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      savePhotoProof(target, reader.result);
      photoUploadInput.value = "";
      targetPhotoProof = null;
    });
    reader.readAsDataURL(file);
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

function restoreSignature() {
  if (!signatureCanvas || !localState.signatureImage) return;

  const context = signatureCanvas.getContext("2d");
  const image = new Image();
  image.addEventListener("load", () => {
    context.drawImage(image, 0, 0, signatureCanvas.clientWidth, signatureCanvas.clientHeight);
    signatureHasInk = true;
    signatureBox?.classList.add("signed");
    if (signatureLine) signatureLine.textContent = "Assinatura salva";
    if (confirmSignatureButton) confirmSignatureButton.disabled = false;
    updateCompletionState();
  });
  image.src = localState.signatureImage;
}

function clearSignature() {
  if (!signatureCanvas) return;

  const context = signatureCanvas.getContext("2d");
  context.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  signatureHasInk = false;
  delete localState.signatureImage;
  saveLocalState();
  signatureBox?.classList.remove("signed");
  if (signatureLine) signatureLine.textContent = "Pendente";
  if (confirmSignatureButton) confirmSignatureButton.disabled = true;
  addAudit("Assinatura limpa", "Assinatura removida da OS-1048");
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
  restoreSignature();
}

if (clearSignatureButton) {
  clearSignatureButton.addEventListener("click", clearSignature);
}

if (confirmSignatureButton) {
  confirmSignatureButton.addEventListener("click", () => {
    if (!signatureHasInk) return;

    signatureBox.classList.add("signed");
    signatureLine.textContent = "Assinatura confirmada";
    localState.signatureImage = signatureCanvas.toDataURL("image/png");
    saveLocalState();
    addAudit("Assinatura salva", "Assinatura do cliente vinculada a OS-1048");
    queueOfflineAction("assinatura", "Assinatura OS-1048");
    updateCompletionState();
  });
}

if (trackerChipInput) {
  trackerChipInput.addEventListener("input", () => {
    trackerChipVerified = false;
    trackerChipInput.classList.remove("verified");

    if (trackerChipStatus) {
      trackerChipStatus.textContent = "Confirme o ID do chip";
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
      trackerChipStatus.textContent = "Informe o ID do chip completo";
      trackerChipStatus.classList.add("error");
      trackerChipStatus.classList.remove("verified");
      trackerChipInput?.focus();
      updateCompletionState();
      return;
    }

    trackerChipVerified = true;
    trackerChipInput.classList.add("verified");
    trackerChipStatus.textContent = `ID do chip confirmado: ${trackerChipInput.value.trim()}`;
    trackerChipStatus.classList.add("verified");
    trackerChipStatus.classList.remove("error");
    localState.trackerChip = trackerChipInput.value.trim();
    saveLocalState();
    addAudit("ID do chip confirmado", trackerChipInput.value.trim());
    queueOfflineAction("chip", trackerChipInput.value.trim());
    updateCompletionState();
  });
}

if (finishOsButton) {
  finishOsButton.addEventListener("click", () => {
    finishOsButton.textContent = "OS concluida";
    completionStatus.textContent = "Concluida";

    if (!currentOsCompletionRegistered) {
      const currentOrder = serviceOrders.find((order) => order.code === "OS-1048");
      if (currentOrder) {
        currentOrder.status = "completed";
        currentOrder.completedAt = getNowLabel();
        updateLocalState("serviceOrders", serviceOrders);
        addAudit("OS concluida", "OS-1048 finalizada com fotos, assinatura e ID do chip");
        queueOfflineAction("os-completed", "OS-1048 concluida");
        notifyLocal("OS-1048 concluida.");
        renderOrderQueue();
        renderDispatchBoard();
        renderMobileOrders();
        renderTeamReport();
        renderMonthlySchedule();
        renderMonthCalendar();
        renderTracking?.();
      }
      currentOsCompletionRegistered = true;
    }
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

const defaultTechnicians = [
  { id: 1, name: "Bruno", phone: "(11) 90000-0004", status: "Em atendimento", team: "Equipe 1" },
  { id: 2, name: "Ana", phone: "(11) 90000-0005", status: "A caminho", team: "Equipe 2" },
  { id: 3, name: "Marcos", phone: "(11) 90000-0006", status: "Checklist final", team: "Equipe 3" },
  { id: 4, name: "Diego", phone: "(11) 90000-0007", status: "Disponivel", team: "Equipe 4" }
];

let technicians = localState.technicians || defaultTechnicians;

const teamOrder = ["Equipe 1", "Equipe 2", "Equipe 3", "Equipe 4", "Equipe 5"];
const defaultTeamLocations = [
  { team: "Equipe 1", vehicle: "Carro 01", x: 22, y: 48, status: "Em atendimento", speed: 0, updated: "Agora" },
  { team: "Equipe 2", vehicle: "Carro 02", x: 58, y: 35, status: "A caminho", speed: 38, updated: "Agora" },
  { team: "Equipe 3", vehicle: "Carro 03", x: 42, y: 68, status: "Em rota", speed: 44, updated: "Agora" },
  { team: "Equipe 4", vehicle: "Carro 04", x: 74, y: 54, status: "Agendada", speed: 18, updated: "Agora" },
  { team: "Equipe 5", vehicle: "Plantao", x: 82, y: 23, status: "Disponivel", speed: 0, updated: "Agora" }
];
let teamLocations = Array.isArray(localState.teamLocations) ? localState.teamLocations : defaultTeamLocations;
let activeTrackingTeam = getActiveTeam();

function syncTrackingLocations() {
  teamLocations = teamOrder.map((team) => {
    const saved = teamLocations.find((location) => location.team === team);
    const fallback = defaultTeamLocations.find((location) => location.team === team);
    return { ...fallback, ...saved, team };
  });
  updateLocalState("teamLocations", teamLocations);
  return teamLocations;
}

function getTeamMembers(team) {
  const members = technicians.filter((tech) => tech.team === team).map((tech) => tech.name);
  return members.length > 0 ? members.join(", ") : "Sem tecnico";
}

function getTeamCurrentOrder(team) {
  const activeOrder = serviceOrders
    .filter((order) => order.team === team && order.status !== "completed")
    .sort((a, b) => getPriorityRank({ classList: { contains: (className) => getOrderClass(a) === className } }) - getPriorityRank({ classList: { contains: (className) => getOrderClass(b) === className } }) || getScheduleTime({ textContent: a.time }) - getScheduleTime({ textContent: b.time }))[0];
  return activeOrder?.code || "Sem OS";
}

function getTrackingStatus(team, fallbackStatus) {
  const teamTechs = technicians.filter((tech) => tech.team === team);
  const busy = teamTechs.find((tech) => tech.status && tech.status !== "Disponivel");
  return busy?.status || fallbackStatus || "Disponivel";
}

function getTrackingTone(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("offline")) return "offline";
  if (normalized.includes("caminho") || normalized.includes("rota") || normalized.includes("agendada")) return "warning";
  return "";
}

function getTrackingTeamClass(team) {
  const index = teamOrder.indexOf(team);
  return index >= 0 ? `team-color-${index + 1}` : "team-color-1";
}

function getVisibleTeamLocations() {
  const locations = syncTrackingLocations();
  if (canSeeAllOrders()) return locations;
  return locations.filter((location) => location.team === getActiveTeam());
}

function renderTracking() {
  if (!trackingMarkerLayers.length && !trackingTeamLists.length) return;

  const visibleLocations = getVisibleTeamLocations();
  activeTrackingTeam = canSeeAllOrders() ? activeTrackingTeam : getActiveTeam();
  if (!visibleLocations.some((location) => location.team === activeTrackingTeam)) {
    activeTrackingTeam = visibleLocations[0]?.team || getActiveTeam();
  }

  const markerHtml = visibleLocations.map((location) => {
    const status = getTrackingStatus(location.team, location.status);
    const tone = getTrackingTone(status);
    const os = getTeamCurrentOrder(location.team);
    const teamColorClass = getTrackingTeamClass(location.team);
    return `
      <button class="tracking-marker ${teamColorClass} ${tone}${location.team === activeTrackingTeam ? " active" : ""}" type="button" data-tracking-team="${escapeHtml(location.team)}" style="--x: ${Number(location.x)}%; --y: ${Number(location.y)}%;">
        <strong>${escapeHtml(location.team)}</strong>
        <small>${escapeHtml(location.vehicle)} - ${escapeHtml(status)}</small>
      </button>
    `;
  }).join("");

  const cardHtml = visibleLocations.length === 0 ? `
    <article class="tracking-empty">
      <strong>Nenhuma equipe visivel</strong>
      <small>Entre com uma conta de equipe ou selecione um perfil com permissao.</small>
    </article>
  ` : visibleLocations.map((location) => {
    const status = getTrackingStatus(location.team, location.status);
    const tone = getTrackingTone(status);
    const os = getTeamCurrentOrder(location.team);
    const teamColorClass = getTrackingTeamClass(location.team);
    return `
      <button class="tracking-team-card ${teamColorClass} ${location.team === activeTrackingTeam ? " active" : ""}" type="button" data-tracking-team="${escapeHtml(location.team)}">
        <div class="tracking-team-card-head">
          <div>
            <strong><span class="tracking-team-dot" aria-hidden="true"></span>${escapeHtml(location.team)}</strong>
            <span>${escapeHtml(getTeamMembers(location.team))}</span>
          </div>
          <span class="pill ${tone === "offline" ? "red" : tone === "warning" ? "amber" : "teal"}">${escapeHtml(status)}</span>
        </div>
        <div class="tracking-team-meta">
          <div>
            <span>Veiculo</span>
            <strong>${escapeHtml(location.vehicle)}</strong>
          </div>
          <div>
            <span>OS atual</span>
            <strong>${escapeHtml(os)}</strong>
          </div>
          <div>
            <span>Velocidade</span>
            <strong>${Number(location.speed) || 0} km/h</strong>
          </div>
          <div>
            <span>Ultimo sinal</span>
            <strong>${escapeHtml(location.updated || "Agora")}</strong>
          </div>
        </div>
        <div class="tracking-team-card-foot">
          <small>Use GPS real depois para atualizar automaticamente.</small>
          <strong>${escapeHtml(os)}</strong>
        </div>
      </button>
    `;
  }).join("");

  trackingMarkerLayers.forEach((layer) => {
    layer.innerHTML = markerHtml;
  });
  trackingTeamLists.forEach((list) => {
    list.innerHTML = cardHtml;
  });

  if (trackingVisibleCount) {
    trackingVisibleCount.textContent = `${visibleLocations.length} equipe${visibleLocations.length === 1 ? "" : "s"}`;
  }

  document.querySelectorAll("[data-tracking-team]").forEach((item) => {
    item.addEventListener("click", () => {
      activeTrackingTeam = item.dataset.trackingTeam;
      if (!canSeeAllOrders()) setActiveTeam(activeTrackingTeam);
      renderTracking();
    });
  });
}

function refreshTrackingPositions() {
  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  teamLocations = syncTrackingLocations().map((location) => {
    const moving = getTrackingStatus(location.team, location.status) !== "Disponivel";
    return {
      ...location,
      x: Math.min(88, Math.max(8, Number(location.x) + Math.floor(Math.random() * 9) - 4)),
      y: Math.min(82, Math.max(14, Number(location.y) + Math.floor(Math.random() * 9) - 4)),
      speed: moving ? Math.max(0, Number(location.speed) + Math.floor(Math.random() * 13) - 6) : 0,
      updated: now
    };
  });
  updateLocalState("teamLocations", teamLocations);
  trackingUpdatedLabels.forEach((label) => {
    label.textContent = `Atualizado ${now}`;
  });
  addAudit("Rastreamento atualizado", "Posicoes locais das equipes atualizadas");
  renderTracking();
}

refreshTrackingButtons.forEach((button) => {
  button.addEventListener("click", refreshTrackingPositions);
});

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
  renderTracking();
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
    updateLocalState("technicians", technicians);
    addAudit("Tecnico salvo", `${data.name} - ${data.team} - ${data.status}`);
    queueOfflineAction("tecnico", data.name);
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
    updateLocalState("technicians", technicians);
    addAudit("Tecnico excluido", "Cadastro removido localmente");
    queueOfflineAction("tecnico-delete", "Tecnico removido");
    const nextTech = technicians[index] || technicians[index - 1] || null;
    fillTechnicianForm(nextTech);
    renderTechnicians();
  });
}

refreshDropzones();
if (trackerChipInput && localState.trackerChip) {
  trackerChipInput.value = localState.trackerChip;
  trackerChipInput.classList.add("verified");
  trackerChipVerified = true;
  if (trackerChipStatus) {
    trackerChipStatus.textContent = `ID do chip confirmado: ${localState.trackerChip}`;
    trackerChipStatus.classList.add("verified");
  }
}
updateCompletionState();
renderOrderQueue();
renderDispatchBoard();
renderMobileOrders();
renderTeamReport();
renderMonthlySchedule();
renderMonthCalendar();
renderNewOsStep();
renderTracking();
renderSyncStatus();
renderAuditLog();
renderChatThread();
renderSavedPhotos();
renderActiveAccount();
renderTeamAccounts();
renderTechnicians();
fillTechnicianForm(technicians[0]);
sortServiceOrdersByPriority();
renderInventory();
