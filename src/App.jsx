const { useEffect, useMemo, useRef, useState } = React;

const teams = ["Equipe 1", "Equipe 2", "Equipe 3", "Equipe 4", "Equipe 5"];

const roleConfig = {
  admin: {
    label: "Administrador",
    eyebrow: "Gestao geral",
    title: "Painel operacional",
    summary: "Visao completa da operacao",
    detail: "Agenda, estoque, equipes e relatorios",
    sections: ["painel", "agenda", "ordens", "estoque", "clientes", "equipe", "rastreamento", "financeiro", "relatorios"],
    defaultSection: "painel"
  },
  atendimento: {
    label: "Atendimento",
    eyebrow: "Atendimento",
    title: "Agenda e OS",
    summary: "Equipes e OS em foco",
    detail: "Agenda, clientes, rotas e relatorios",
    sections: ["painel", "agenda", "ordens", "clientes", "equipe", "rastreamento", "relatorios"],
    defaultSection: "painel"
  },
  estoque: {
    label: "Estoque",
    eyebrow: "Almoxarifado",
    title: "Estoque",
    summary: "Controle de materiais",
    detail: "Entradas, saidas, QR Code e alertas",
    sections: ["estoque"],
    defaultSection: "estoque"
  },
  tecnico: {
    label: "Tecnico",
    eyebrow: "Tecnico",
    title: "Minhas OS",
    summary: "OS da equipe logada",
    detail: "Atendimentos, fotos, assinatura e ID CHIP",
    sections: ["painel", "agenda", "ordens"],
    defaultSection: "painel"
  }
};

const sectionLabels = {
  painel: "Painel",
  agenda: "Agenda",
  ordens: "Ordens",
  estoque: "Estoque",
  clientes: "Clientes",
  equipe: "Equipe",
  rastreamento: "Rastreamento",
  financeiro: "Financeiro",
  relatorios: "Relatorios"
};

const sectionIcons = {
  painel: "layout-dashboard",
  agenda: "calendar-days",
  ordens: "clipboard-list",
  estoque: "package",
  clientes: "users",
  equipe: "user-cog",
  rastreamento: "map-pin",
  financeiro: "dollar-sign",
  relatorios: "bar-chart-3"
};

const initialOrders = [
  {
    code: "OS-1048",
    client: "Alpha Condominio",
    address: "Rua das Flores, 120",
    phone: "(11) 4000-1000",
    description: "Portao automatico sem resposta",
    team: "Equipe 1",
    technician: "Bruno",
    time: "09:30",
    date: "2026-06-05",
    priority: "high",
    status: "in_progress",
    materials: ["Fonte 12V 2A", "Sensor magnetico"],
    notes: "Verificar central, fonte e sensores antes de liberar."
  },
  {
    code: "OS-1052",
    client: "Teste Agenda",
    address: "Rua Mensal, 55",
    phone: "(11) 4000-2000",
    description: "Teste de agendamento mensal",
    team: "Equipe 2",
    technician: "Tecnico Teste",
    time: "09:00",
    date: "2026-06-06",
    priority: "warning",
    status: "scheduled",
    materials: ["Controle remoto TX"],
    notes: "OS gerada pelo planejamento mensal."
  },
  {
    code: "OS-1050",
    client: "Clinica Santa Clara",
    address: "Rua Saude, 88",
    phone: "(11) 4000-3000",
    description: "Camera sem imagem",
    team: "Equipe 2",
    technician: "Ana",
    time: "14:00",
    date: "2026-06-05",
    priority: "warning",
    status: "pending",
    materials: ["Camera dome Full HD", "Cabo UTP Cat6"],
    notes: "Material solicitado para atendimento."
  },
  {
    code: "OS-1049",
    client: "Mercado Central",
    address: "Av. Central, 410",
    phone: "(11) 4000-4000",
    description: "Preventiva em cameras CFTV",
    team: "Equipe 3",
    technician: "Marcos",
    time: "11:00",
    date: "2026-06-05",
    priority: "normal",
    status: "scheduled",
    materials: ["Cabo UTP Cat6"],
    notes: "Preventiva mensal."
  },
  {
    code: "OS-1051",
    client: "Residencial Norte",
    address: "Rua Norte, 900",
    phone: "(11) 4000-5000",
    description: "Rede e DVR",
    team: "Equipe 4",
    technician: "Diego",
    time: "16:30",
    date: "2026-06-07",
    priority: "normal",
    status: "scheduled",
    materials: ["Cabo UTP Cat6", "Fonte 12V 2A"],
    notes: "Checar DVR e rede."
  }
];

const initialProducts = [
  { name: "Fonte 12V 2A", sku: "FON-12V-2A", category: "Energia", location: "A1", qty: 8, min: 10, cost: 48 },
  { name: "Bateria 7Ah", sku: "BAT-7AH", category: "Energia", location: "A2", qty: 10, min: 6, cost: 96 },
  { name: "Sensor magnetico", sku: "SEN-MAG", category: "Alarme", location: "B3", qty: 42, min: 15, cost: 32 },
  { name: "Camera dome Full HD", sku: "CAM-DOME-HD", category: "CFTV", location: "C1", qty: 14, min: 8, cost: 189 },
  { name: "Cabo UTP Cat6", sku: "CAB-CAT6", category: "Rede", location: "D2", qty: 5, min: 6, cost: 420 },
  { name: "Controle remoto TX", sku: "CTRL-TX", category: "Automacao", location: "B1", qty: 24, min: 12, cost: 58 }
];

const teamLocations = [
  { team: "Equipe 1", members: "Bruno e Leo", status: "Em atendimento", vehicle: "Fiorino 01", x: 24, y: 48, tone: "teal" },
  { team: "Equipe 2", members: "Ana e Rui", status: "A caminho", vehicle: "Mobi 02", x: 42, y: 32, tone: "amber" },
  { team: "Equipe 3", members: "Marcos e Bia", status: "Em rota", vehicle: "Saveiro 03", x: 58, y: 58, tone: "teal" },
  { team: "Equipe 4", members: "Diego e Caio", status: "Agendada", vehicle: "Fiorino 04", x: 74, y: 42, tone: "amber" },
  { team: "Equipe 5", members: "Plantao", status: "Disponivel", vehicle: "Onix 05", x: 84, y: 66, tone: "teal" }
];

const roleOptions = Object.entries(roleConfig).map(([value, config]) => ({ value, label: config.label }));

function Icon({ name, className = "h-4 w-4" }) {
  return <i data-lucide={name} className={className} aria-hidden="true" />;
}

function Pill({ tone = "teal", children }) {
  const tones = {
    teal: "bg-teal/10 text-teal border-teal/20",
    amber: "bg-amber/10 text-amber border-amber/20",
    red: "bg-red/10 text-red border-red/20",
    dark: "bg-dark text-white border-dark"
  };
  return <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function Card({ children, className = "" }) {
  return <section className={`rounded-lg border border-line bg-panel shadow-panel ${className}`}>{children}</section>;
}

function statusLabel(order) {
  if (order.status === "completed") return { text: "Concluida", tone: "teal" };
  if (order.priority === "high") return { text: "Alta", tone: "red" };
  if (order.priority === "warning") return { text: "Pendente", tone: "amber" };
  return { text: "Agenda", tone: "teal" };
}

function priorityRank(order) {
  if (order.priority === "high") return 0;
  if (order.priority === "warning") return 1;
  return 2;
}

function formatDate(date) {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

function App() {
  const [role, setRole] = useState(() => localStorage.getItem("react-role") || "atendimento");
  const [activeTeam, setActiveTeam] = useState(() => localStorage.getItem("react-team") || "Equipe 1");
  const [section, setSection] = useState(roleConfig[role]?.defaultSection || "painel");
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(initialProducts[0].sku);
  const [reportTeam, setReportTeam] = useState("Todas");
  const [showNewOs, setShowNewOs] = useState(false);
  const [completion, setCompletion] = useState({
    checkin: false,
    photos: 2,
    signed: false,
    chip: ""
  });

  const currentRole = roleConfig[role] || roleConfig.admin;
  const visibleSections = currentRole.sections;
  const isAdmin = role === "admin";
  const isFieldRole = role === "tecnico";

  useEffect(() => {
    if (!visibleSections.includes(section)) {
      setSection(currentRole.defaultSection);
    }
    localStorage.setItem("react-role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("react-team", activeTeam);
  }, [activeTeam]);

  useEffect(() => {
    window.lucide?.createIcons();
  });

  const visibleOrders = useMemo(() => {
    const source = isFieldRole ? orders.filter((order) => order.team === activeTeam) : orders;
    return [...source].sort((a, b) => priorityRank(a) - priorityRank(b) || a.time.localeCompare(b.time));
  }, [orders, role, activeTeam]);

  const metrics = useMemo(() => {
    const open = orders.filter((order) => order.status !== "completed").length;
    const critical = products.filter((product) => product.qty <= product.min).length;
    const completed = orders.filter((order) => order.status === "completed").length + 7;
    return { open, critical, completed };
  }, [orders, products]);

  const canFinish = completion.checkin && completion.photos >= 3 && completion.signed && completion.chip.trim().length >= 6;

  function changeRole(nextRole) {
    setRole(nextRole);
    setSection(roleConfig[nextRole].defaultSection);
  }

  function addOrder(payload) {
    setOrders((current) => [payload, ...current]);
    setShowNewOs(false);
    setSection("agenda");
  }

  function updateStock(sku, delta) {
    setProducts((current) => current.map((product) => (
      product.sku === sku ? { ...product, qty: Math.max(0, product.qty + delta) } : product
    )));
  }

  function completeMainOrder() {
    if (!canFinish) return;
    setOrders((current) => current.map((order) => (
      order.code === "OS-1048" ? { ...order, status: "completed", priority: "normal" } : order
    )));
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar role={role} currentRole={currentRole} visibleSections={visibleSections} section={section} setSection={setSection} />

      <main className="hidden w-full max-w-[1560px] gap-5 p-7 lg:grid">
        <Topbar
          role={role}
          currentRole={currentRole}
          activeTeam={activeTeam}
          setActiveTeam={setActiveTeam}
          changeRole={changeRole}
          onNewOs={() => setShowNewOs(true)}
        />

        {section === "painel" && (
          <>
            <Metrics role={role} metrics={metrics} />
            <div className="grid gap-4">
              <AgendaPanel orders={visibleOrders} onNewOs={() => setShowNewOs(true)} />
              <OrdersPanel orders={visibleOrders} />
            </div>
          </>
        )}

        {section === "agenda" && <AgendaPanel orders={visibleOrders} onNewOs={() => setShowNewOs(true)} />}
        {section === "ordens" && <OrdersPanel orders={visibleOrders} />}
        {section === "estoque" && <StockPanel products={products} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} updateStock={updateStock} />}
        {section === "clientes" && <ClientsPanel />}
        {section === "equipe" && <TeamPanel />}
        {section === "rastreamento" && <TrackingPanel />}
        {section === "financeiro" && isAdmin && <FinancePanel />}
        {section === "relatorios" && <ReportsPanel orders={orders} reportTeam={reportTeam} setReportTeam={setReportTeam} />}
      </main>

      <MobileTechnician
        role={role}
        activeTeam={activeTeam}
        setActiveTeam={setActiveTeam}
        orders={orders}
        completion={completion}
        setCompletion={setCompletion}
        canFinish={canFinish}
        completeMainOrder={completeMainOrder}
      />

      {showNewOs && <NewOsDialog onClose={() => setShowNewOs(false)} onSubmit={addOrder} />}
    </div>
  );
}

function Sidebar({ role, currentRole, visibleSections, section, setSection }) {
  return (
    <aside className="hidden h-screen sticky top-0 bg-dark p-6 text-white shadow-[12px_0_36px_rgba(15,17,20,0.12)] lg:flex lg:flex-col">
      <div className="flex items-center gap-3">
        <img src="./logo.jpg" className="h-14 w-14 rounded-lg bg-black object-cover ring-1 ring-white/20" alt="Logo da empresa" />
        <div>
          <strong className="block text-lg">Controle OS</strong>
          <span className="text-sm text-white/62">React + Tailwind</span>
        </div>
      </div>

      <nav className="mt-8 grid gap-2" aria-label="Menu principal">
        {visibleSections.map((key) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`relative flex min-h-11 items-center gap-3 rounded-lg px-4 text-left text-sm font-bold transition ${
              section === key ? "bg-white/10 text-white before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:rounded-r-full before:bg-teal" : "text-white/72 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name={sectionIcons[key]} />
            {sectionLabels[key]}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-white/15 p-4">
        <span className="block text-sm text-white/62">Plantao do dia</span>
        <strong className="mt-2 block text-lg">{currentRole.summary}</strong>
        <small className="mt-1 block text-white/62">{currentRole.detail}</small>
      </div>
    </aside>
  );
}

function Topbar({ role, currentRole, activeTeam, setActiveTeam, changeRole, onNewOs }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-[360px]">
        <p className="mb-1 text-sm text-muted">{currentRole.eyebrow}</p>
        <h1 className="text-4xl font-black leading-tight text-ink">{currentRole.title}</h1>
      </div>
      <div className="flex flex-wrap items-end justify-end gap-2">
        <label className="grid gap-1 text-xs text-muted">
          Perfil
          <select value={role} onChange={(event) => changeRole(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink">
            {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        {role === "tecnico" && (
          <label className="grid gap-1 text-xs text-muted">
            Equipe
            <select value={activeTeam} onChange={(event) => setActiveTeam(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink">
              {teams.map((team) => <option key={team}>{team}</option>)}
            </select>
          </label>
        )}
        {(role === "admin" || role === "atendimento") && (
          <button onClick={onNewOs} className="inline-flex h-10 items-center gap-2 rounded-lg bg-dark px-4 text-sm font-bold text-white shadow-lift">
            <Icon name="plus-circle" />
            Nova OS
          </button>
        )}
        <span className="inline-flex h-10 items-center rounded-lg border border-line bg-white px-3 text-xs font-bold text-muted">{currentRole.label}</span>
      </div>
    </header>
  );
}

function Metrics({ role, metrics }) {
  const cards = [
    { label: "OS em andamento", value: metrics.open, note: "Prioridades no topo", show: role !== "estoque" },
    { label: "Estoque critico", value: metrics.critical, note: "Itens abaixo do minimo", show: role === "admin" || role === "estoque" },
    { label: "SLA no prazo", value: "92%", note: "Ultimos 30 dias", show: role !== "estoque" },
    { label: "OS concluidas", value: metrics.completed, note: "Semana atual", show: role !== "estoque" }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores">
      {cards.filter((card) => card.show).map((card) => (
        <Card key={card.label} className="p-5">
          <span className="text-sm text-muted">{card.label}</span>
          <strong className="mt-2 block text-3xl font-black">{card.value}</strong>
          <small className="mt-1 block text-muted">{card.note}</small>
        </Card>
      ))}
    </section>
  );
}

function AgendaPanel({ orders, onNewOs }) {
  const monthly = orders.filter((order) => order.date?.startsWith("2026-06"));
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-sm text-muted">Agenda das equipes</span>
          <h2 className="text-lg font-black">Planejamento mensal e distribuicao</h2>
        </div>
        <div className="flex rounded-lg border border-line bg-soft p-1">
          {["Hoje", "Semana", "Mes"].map((item, index) => (
            <button key={item} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold ${index === 0 ? "bg-white shadow-sm" : "text-muted"}`}>
              <Icon name={index === 0 ? "calendar-check" : "calendar-days"} />
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-soft p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-muted">Planejamento mensal</span>
            <strong className="block">OS agendadas de junho de 2026</strong>
          </div>
          <button onClick={onNewOs} className="inline-flex h-10 items-center gap-2 rounded-lg bg-dark px-4 text-sm font-bold text-white">
            <Icon name="calendar-plus" />
            Agendar OS
          </button>
        </div>
        <div className="thin-scroll mt-3 grid max-h-64 gap-2 overflow-auto">
          {monthly.map((order) => {
            const label = statusLabel(order);
            return (
              <article key={order.code} className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-line bg-white p-3">
                <div className="grid min-h-12 place-items-center rounded-lg bg-dark text-white">
                  <strong>{formatDate(order.date)}</strong>
                  <span className="text-xs">{order.time}</span>
                </div>
                <div className="min-w-0">
                  <strong className="block truncate">{order.code} - {order.client}</strong>
                  <span className="block truncate text-sm text-muted">{order.description}</span>
                  <small className="text-muted">{order.team} - {order.technician}</small>
                </div>
                <Pill tone={label.tone}>{label.text}</Pill>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[220px_minmax(0,1fr)] gap-3">
        <section className="rounded-lg border border-line bg-soft p-3">
          <strong>OS disponiveis</strong>
          <small className="block text-muted">Prioridade sempre primeiro</small>
          <div className="mt-3 grid gap-2">
            {orders.slice(0, 3).map((order) => <OrderMiniCard key={order.code} order={order} />)}
          </div>
        </section>
        <section className="thin-scroll grid grid-cols-5 gap-3 overflow-x-auto pb-1">
          {teams.map((team) => (
            <div key={team} className="min-w-[176px] rounded-lg border border-line bg-soft p-3">
              <strong className="flex items-center justify-between">
                {team}
                <span className="h-2.5 w-2.5 rounded-full bg-teal" />
              </strong>
              <small className="text-muted">{teamLocations.find((item) => item.team === team)?.members}</small>
              <div className="mt-3 grid gap-2">
                {orders.filter((order) => order.team === team).slice(0, 2).map((order) => <OrderMiniCard key={order.code} order={order} />)}
              </div>
            </div>
          ))}
        </section>
      </div>
    </Card>
  );
}

function OrderMiniCard({ order }) {
  const border = order.priority === "high" ? "border-l-red" : order.priority === "warning" ? "border-l-amber" : "border-l-teal";
  return (
    <article className={`rounded-lg border border-l-4 border-line ${border} bg-white p-3 shadow-sm`}>
      <strong className="block">{order.code}</strong>
      <span className="block truncate text-sm">{order.client}</span>
      <small className="text-muted">{order.time} - {order.status === "completed" ? "concluida" : "aberta"}</small>
    </article>
  );
}

function OrdersPanel({ orders }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-muted">Ordens de servico</span>
          <h2 className="text-lg font-black">Fila operacional</h2>
        </div>
        <Pill tone="teal">{orders.length} OS</Pill>
      </div>
      <div className="mt-4 grid gap-2">
        {orders.map((order) => {
          const label = statusLabel(order);
          return (
            <article key={order.code} className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-line bg-soft p-3">
              <strong>{order.code}</strong>
              <div className="min-w-0">
                <strong className="block truncate">{order.client}</strong>
                <span className="block truncate text-sm text-muted">{order.address} - {order.description}</span>
              </div>
              <div className="text-right">
                <Pill tone={label.tone}>{label.text}</Pill>
                <small className="mt-1 block text-muted">{order.team} - {order.time}</small>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}

function StockPanel({ products, selectedProduct, setSelectedProduct, updateStock }) {
  const selected = products.find((product) => product.sku === selectedProduct) || products[0];
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-sm text-muted">Almoxarifado com QR Code</span>
          <h2 className="text-lg font-black">Produtos e movimentacoes</h2>
        </div>
        <Pill tone="amber">{products.filter((product) => product.qty <= product.min).length} baixos</Pill>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <button key={product.sku} onClick={() => setSelectedProduct(product.sku)} className={`rounded-lg border p-4 text-left shadow-sm ${selectedProduct === product.sku ? "border-dark bg-white" : "border-line bg-soft"}`}>
              <strong className="block">{product.name}</strong>
              <span className="mt-1 block text-sm text-muted">{product.sku} - {product.location}</span>
              <div className="mt-3 flex items-center justify-between">
                <Pill tone={product.qty <= product.min ? "amber" : "teal"}>{product.qty} un.</Pill>
                <small className="text-muted">min. {product.min}</small>
              </div>
            </button>
          ))}
        </div>
        <aside className="rounded-lg border border-line bg-soft p-4">
          <span className="text-sm text-muted">Produto selecionado</span>
          <strong className="mt-1 block text-xl">{selected.name}</strong>
          <div className="my-4 grid h-32 place-items-center rounded-lg border border-dashed border-line bg-white text-center">
            <Icon name="qr-code" className="h-14 w-14 text-dark" />
            <small className="mt-1 block text-muted">{selected.sku}</small>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => updateStock(selected.sku, 1)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-dark text-sm font-bold text-white">
              <Icon name="arrow-down-to-line" />
              Entrada
            </button>
            <button onClick={() => updateStock(selected.sku, -1)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white text-sm font-bold">
              <Icon name="arrow-up-from-line" />
              Saida
            </button>
          </div>
          <div className="mt-4 rounded-lg border border-line bg-white p-3">
            <strong>Historico</strong>
            <small className="mt-1 block text-muted">Movimentos ficam prontos para gravar no backend.</small>
          </div>
        </aside>
      </div>
    </Card>
  );
}

function ClientsPanel() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-muted">Cliente Alpha Condominio</span>
          <h2 className="text-lg font-black">Historico do cliente</h2>
        </div>
        <Pill tone="teal">Cliente ativo</Pill>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          ["Cliente", "Alpha Condominio", "Sindico Joao"],
          ["Endereco", "Rua das Flores, 120", "Portaria 24h"],
          ["Ultima OS", "OS-1048", "Equipe 1"],
          ["Historico", "2 OS", "Fotos e assinaturas"]
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-lg border border-line bg-soft p-4">
            <span className="text-sm text-muted">{label}</span>
            <strong className="mt-1 block">{value}</strong>
            <small className="text-muted">{detail}</small>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3">
        {["OS-1048 - Portao automatico sem resposta", "OS-0987 - Preventiva do motor e sensores"].map((item) => (
          <article key={item} className="rounded-lg border border-line bg-white p-4">
            <strong>{item}</strong>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {["Antes", "Durante", "Depois", "Assinatura"].map((proof) => (
                <button key={proof} className="rounded-lg border border-line bg-soft p-3 text-left text-sm font-bold">{proof}</button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function TeamPanel() {
  return (
    <Card className="p-5">
      <span className="text-sm text-muted">Campo</span>
      <h2 className="text-lg font-black">Status das equipes e tecnicos</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {teamLocations.map((team) => (
          <article key={team.team} className="rounded-lg border border-line bg-soft p-4">
            <strong className="block">{team.team}</strong>
            <span className="mt-1 block text-sm text-muted">{team.members}</span>
            <Pill tone={team.tone}>{team.status}</Pill>
          </article>
        ))}
      </div>
    </Card>
  );
}

function TrackingPanel() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-muted">Rastreamento</span>
          <h2 className="text-lg font-black">Localizacao das equipes</h2>
        </div>
        <Pill tone="teal">Atualizado agora</Pill>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-line bg-[#e9edf2]">
          <div className="absolute left-0 right-0 top-1/2 h-8 -rotate-6 bg-white/70" />
          <div className="absolute bottom-20 left-0 right-0 h-7 rotate-12 bg-white/70" />
          <div className="absolute left-5 top-5 rounded-lg bg-white/90 p-3 shadow-sm">
            <strong className="block">Mapa operacional</strong>
            <small className="text-muted">Pronto para dados reais do Traccar</small>
          </div>
          {teamLocations.map((team) => (
            <button key={team.team} className={`absolute rounded-lg border bg-white px-3 py-2 text-left shadow-lift ${team.tone === "amber" ? "border-amber/30" : "border-teal/30"}`} style={{ left: `${team.x}%`, top: `${team.y}%` }}>
              <strong className="block text-sm">{team.team}</strong>
              <small className="text-muted">{team.vehicle}</small>
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          {teamLocations.map((team) => (
            <article key={team.team} className="rounded-lg border border-line bg-soft p-4">
              <strong className="block">{team.team}</strong>
              <span className="text-sm text-muted">{team.members} - {team.vehicle}</span>
              <div className="mt-2 flex items-center justify-between">
                <Pill tone={team.tone}>{team.status}</Pill>
                <small className="text-muted">chip ativo</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Card>
  );
}

function FinancePanel() {
  return (
    <Card className="p-5">
      <span className="text-sm text-muted">Financeiro administrativo</span>
      <h2 className="text-lg font-black">Servicos e materiais</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          ["Servicos", "R$ 51.800"],
          ["Materiais", "R$ 34.600"],
          ["Previsto", "R$ 86.400"],
          ["Meta", "R$ 128.900"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-soft p-4">
            <span className="text-sm text-muted">{label}</span>
            <strong className="mt-1 block text-2xl">{value}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReportsPanel({ orders, reportTeam, setReportTeam }) {
  const rows = teams.map((team, index) => ({
    team,
    completed: orders.filter((order) => order.team === team && order.status === "completed").length + [18, 14, 16, 11, 7][index],
    time: ["1h42", "2h05", "1h58", "2h26", "1h35"][index],
    status: index === 3 ? "Revisar" : index === 1 ? "Acompanhar" : "No padrao"
  })).filter((row) => reportTeam === "Todas" || row.team === reportTeam);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-sm text-muted">Gestao e supervisao</span>
          <h2 className="text-lg font-black">Relatorios</h2>
        </div>
        <label className="grid gap-1 text-xs text-muted">
          Equipe
          <select value={reportTeam} onChange={(event) => setReportTeam(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink">
            <option>Todas</option>
            {teams.map((team) => <option key={team}>{team}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-soft text-muted">
            <tr>
              <th className="p-3">Equipe</th>
              <th className="p-3">OS concluidas</th>
              <th className="p-3">Tempo medio</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {rows.map((row) => (
              <tr key={row.team}>
                <td className="p-3 font-bold">{row.team}</td>
                <td className="p-3">{row.completed}</td>
                <td className="p-3">{row.time}</td>
                <td className="p-3"><Pill tone={row.status === "No padrao" ? "teal" : "amber"}>{row.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MobileTechnician({ role, activeTeam, setActiveTeam, orders, completion, setCompletion, canFinish, completeMainOrder }) {
  const teamOrders = orders.filter((order) => order.team === activeTeam);
  const mainOrder = teamOrders[0] || initialOrders[0];
  return (
    <main className="mx-auto grid min-h-screen max-w-[520px] gap-3 p-3 pb-24 lg:hidden">
      <header className="sticky top-0 z-40 -mx-3 flex items-center gap-3 border-b border-line bg-soft/95 px-3 py-3 backdrop-blur">
        <img src="./logo.jpg" className="h-12 w-12 rounded-lg bg-black object-cover" alt="Logo da empresa" />
        <div className="min-w-0 flex-1">
          <span className="block text-xs text-muted">Area do tecnico</span>
          <strong className="block truncate text-lg">Minhas OS</strong>
        </div>
        <select value={activeTeam} onChange={(event) => setActiveTeam(event.target.value)} className="h-10 rounded-lg border border-line bg-white px-2 text-xs">
          {teams.map((team) => <option key={team}>{team}</option>)}
        </select>
      </header>

      <Card className="flex items-center justify-between p-4">
        <div>
          <span className="text-sm text-muted">Hoje, 05/06</span>
          <strong className="block text-2xl">{teamOrders.length} atendimentos</strong>
        </div>
        <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-dark px-4 font-bold text-white">
          <Icon name="route" />
          Iniciar rota
        </button>
      </Card>

      <section className="grid grid-cols-2 gap-3">
        {[
          ["OS do dia", teamOrders.length],
          ["Pendentes", teamOrders.filter((order) => order.status !== "completed").length],
          ["Concluidas", teamOrders.filter((order) => order.status === "completed").length],
          ["Tempo medio", "1h42"]
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <span className="text-sm text-muted">{label}</span>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </Card>
        ))}
      </section>

      <div className="sticky top-[73px] z-30 grid grid-cols-3 gap-1 rounded-lg border border-line bg-white p-1 shadow-panel">
        {["Agora", "Proximas", "Concluidas"].map((item, index) => (
          <button key={item} className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold ${index === 0 ? "bg-dark text-white" : "text-muted"}`}>
            <Icon name={index === 0 ? "clock" : index === 1 ? "calendar-plus" : "check-circle-2"} />
            {item}
          </button>
        ))}
      </div>

      <Card className="grid gap-2 p-3">
        {teamOrders.map((order, index) => {
          const label = statusLabel(order);
          return (
            <button key={order.code} className={`rounded-lg border border-l-4 bg-white p-3 text-left ${index === 0 ? "border-dark" : "border-line"}`}>
              <div className="flex items-center gap-3">
                <Pill tone={label.tone}>{label.text}</Pill>
                <strong>{order.code}</strong>
              </div>
              <small className="mt-2 block text-muted">{order.client} - {order.team} - {order.time} - Em aberto</small>
            </button>
          );
        })}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Pill tone="red">Alta</Pill>
          <strong>{mainOrder.code}</strong>
        </div>
        <h2 className="mt-3 text-2xl font-black">{mainOrder.client}</h2>
        <p className="mt-2 text-sm text-muted">{mainOrder.description}. {mainOrder.notes}</p>
        <div className="my-4 grid gap-2 border-y border-line py-3 text-sm text-muted">
          <span>Data e horario: {formatDate(mainOrder.date)} - {mainOrder.time}</span>
          <span>Endereco: {mainOrder.address}</span>
          <span>Telefone: {mainOrder.phone}</span>
          <span>Status: Em andamento</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <a className="grid h-11 place-items-center rounded-lg border border-line bg-white font-bold" href="tel:+551140001000">Ligar</a>
          <a className="grid h-11 place-items-center rounded-lg border border-line bg-white font-bold" href="https://www.google.com/maps/search/?api=1&query=Rua%20das%20Flores%20120" target="_blank" rel="noreferrer">Rota</a>
          <a className="grid h-11 place-items-center rounded-lg border border-line bg-white font-bold" href="https://wa.me/551140001000" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        <button onClick={() => setCompletion((current) => ({ ...current, checkin: true }))} className="mt-3 h-11 w-full rounded-lg bg-dark font-bold text-white">Iniciar Atendimento</button>
        <small className="mt-2 block text-muted">{completion.checkin ? "Atendimento iniciado" : "Atendimento ainda nao iniciado"}</small>
      </Card>

      <Card className="grid gap-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted">Obrigatorio para finalizar</span>
            <h2 className="text-lg font-black">Conclusao da OS</h2>
          </div>
          <Pill tone={canFinish ? "teal" : "amber"}>{canFinish ? "Pronto" : "Pendente"}</Pill>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Antes", "Durante", "Depois"].map((label, index) => (
            <button key={label} onClick={() => setCompletion((current) => ({ ...current, photos: Math.max(current.photos, index + 1) }))} className={`min-h-24 rounded-lg border p-2 text-left text-sm font-bold ${completion.photos > index ? "border-teal bg-teal/10" : "border-dashed border-line bg-white text-muted"}`}>
              Foto {index + 1}
              <span className="block">{label}</span>
            </button>
          ))}
        </div>
        <SignaturePad signed={completion.signed} onSigned={() => setCompletion((current) => ({ ...current, signed: true }))} />
        <label className="grid gap-2 text-sm text-muted">
          ID CHIP
          <input value={completion.chip} onChange={(event) => setCompletion((current) => ({ ...current, chip: event.target.value }))} placeholder="8955 0400 1234 5678 9012" className="h-11 rounded-lg border border-line bg-white px-3 text-ink" />
        </label>
        <button onClick={completeMainOrder} disabled={!canFinish} className="h-11 rounded-lg bg-dark font-bold text-white disabled:bg-slate-400">Concluir OS</button>
      </Card>

      <nav className="fixed bottom-3 left-3 right-3 z-50 mx-auto grid max-w-[492px] grid-cols-4 gap-1 rounded-lg border border-line bg-white/95 p-1 shadow-lift backdrop-blur">
        {["OS", "Agenda", "Rota", "Perfil"].map((item, index) => (
          <button key={item} className={`grid min-h-12 place-items-center rounded-lg text-xs font-bold ${index === 0 ? "bg-dark text-white" : "text-muted"}`}>
            <Icon name={index === 0 ? "clipboard-list" : index === 1 ? "calendar-days" : index === 2 ? "map" : "user"} />
            {item}
          </button>
        ))}
      </nav>
    </main>
  );
}

function SignaturePad({ signed, onSigned }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  function draw(event) {
    const canvas = canvasRef.current;
    if (!canvas || !drawing.current) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#17191c";
    const point = event.touches ? event.touches[0] : event;
    ctx.lineTo(point.clientX - rect.left, point.clientY - rect.top);
    ctx.stroke();
  }

  function start(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    const point = event.touches ? event.touches[0] : event;
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(point.clientX - rect.left, point.clientY - rect.top);
  }

  function stop() {
    if (drawing.current) onSigned();
    drawing.current = false;
  }

  return (
    <div className={`grid gap-2 rounded-lg border p-3 ${signed ? "border-teal bg-teal/10" : "border-line bg-white"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Assinatura do cliente</span>
        <strong className="text-sm">{signed ? "Assinada" : "Pendente"}</strong>
      </div>
      <canvas
        ref={canvasRef}
        width="620"
        height="180"
        className="signature-pad h-36 w-full rounded-lg border border-dashed border-line bg-white"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={stop}
      />
    </div>
  );
}

function NewOsDialog({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    client: "",
    description: "",
    team: "Equipe 1",
    technician: "",
    date: "2026-06-07",
    time: "09:00",
    priority: "normal"
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const number = Math.floor(1100 + Math.random() * 899);
    onSubmit({
      code: `OS-${number}`,
      client: form.client,
      address: "Endereco a confirmar",
      phone: "(11) 4000-0000",
      description: form.description,
      team: form.team,
      technician: form.technician || "Sem tecnico",
      time: form.time,
      date: form.date,
      priority: form.priority,
      status: "scheduled",
      materials: [],
      notes: "Criada pelo React."
    });
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-dark/45 p-4">
      <form onSubmit={submit} className="grid w-full max-w-2xl gap-4 rounded-lg border border-line bg-white p-5 shadow-lift">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-sm text-muted">Cadastro operacional</span>
            <h2 className="text-2xl font-black">Nova OS</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg border border-line">
            <Icon name="x" />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Cliente"><input required value={form.client} onChange={(event) => update("client", event.target.value)} className="h-11 rounded-lg border border-line px-3" /></Field>
          <Field label="Descricao"><input required value={form.description} onChange={(event) => update("description", event.target.value)} className="h-11 rounded-lg border border-line px-3" /></Field>
          <Field label="Equipe"><select value={form.team} onChange={(event) => update("team", event.target.value)} className="h-11 rounded-lg border border-line px-3">{teams.map((team) => <option key={team}>{team}</option>)}</select></Field>
          <Field label="Tecnico"><input value={form.technician} onChange={(event) => update("technician", event.target.value)} className="h-11 rounded-lg border border-line px-3" /></Field>
          <Field label="Data"><input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} className="h-11 rounded-lg border border-line px-3" /></Field>
          <Field label="Horario"><input type="time" value={form.time} onChange={(event) => update("time", event.target.value)} className="h-11 rounded-lg border border-line px-3" /></Field>
          <Field label="Prioridade"><select value={form.priority} onChange={(event) => update("priority", event.target.value)} className="h-11 rounded-lg border border-line px-3"><option value="normal">Normal</option><option value="warning">Media</option><option value="high">Alta</option></select></Field>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-11 rounded-lg border border-line px-4 font-bold">Cancelar</button>
          <button className="h-11 rounded-lg bg-dark px-4 font-bold text-white">Adicionar OS</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1 text-sm text-muted">
      {label}
      {children}
    </label>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
