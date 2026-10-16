import { icon } from './icons.js';
import { CURRENT_USER, STATUSES, PRIORITIES, DIFFICULTIES, CATEGORIES, TEAMS, initials, normalize, seedTickets, filterTickets, createTicket, updateTicket, addComment, metrics, isTicketData } from './domain.js';
import { createAssistantController } from './assistant-ui.js';

const STORAGE_KEY = 'govsafe360.tickets.v1';
let storageWarning = '';
let tickets;
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  const parsed = saved ? JSON.parse(saved) : null;
  tickets = parsed && isTicketData(parsed) ? parsed : seedTickets();
  if (saved && !isTicketData(parsed)) storageWarning = 'Os dados locais eram incompatíveis. A demonstração foi recarregada.';
} catch { tickets = seedTickets(); storageWarning = 'O armazenamento local não está disponível. As alterações durarão apenas nesta sessão.'; }
const state = { page: 'tickets', scope: 'all', role: 'agent', search: '', status: '', priority: '', category: '', team: '', sort: 'recent', view: 'list', currentPage: 1, filtersOpen: false, mobileOpen: false, knowledgeSearch: '' };
const app = document.querySelector('#app');
const dialog = document.querySelector('#app-dialog');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const statusClass = status => ({ 'Aberto': 'open', 'Em atendimento': 'progress', 'Aguardando': 'waiting', 'Resolvido': 'resolved' }[status]);
const priorityClass = priority => ({ 'Baixa': 'low', 'Média': 'medium', 'Alta': 'high', 'Urgente': 'urgent' }[priority]);
const categoryIcon = category => ({ 'Hardware': 'monitor', 'Software': 'code', 'Rede e internet': 'network', 'Acessos': 'key', 'Impressoras': 'printer', 'Outros': 'folder' }[category]);
const fullDate = date => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Cuiaba' }).format(new Date(date));
function relativeDate(date) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  return minutes < 1 ? 'Agora' : minutes < 60 ? `Há ${minutes} min` : minutes < 1440 ? `Há ${Math.floor(minutes / 60)} h` : `Há ${Math.floor(minutes / 1440)} d`;
}
const badge = status => `<span class="status-badge ${statusClass(status)}"><span class="status-dot"></span>${esc(status)}</span>`;
const priority = value => `<span class="priority ${priorityClass(value)}"><span class="priority-bars"><i></i><i></i><i></i></span>${esc(value)}</span>`;
const avatar = (name, small = false) => `<span class="avatar ${small ? 'avatar-sm' : ''} avatar-${(name.charCodeAt(0) || 0) % 5}" title="${esc(name)}">${esc(initials(name))}</span>`;
const options = (values, selected, blank = '') => `${blank ? `<option value="">${esc(blank)}</option>` : ''}${values.map(value => `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}`;
const visibleTickets = () => state.role === 'requester' ? tickets.filter(t => t.requester === CURRENT_USER) : tickets;
const assistant = createAssistantController({ dialog, icon, esc, options, onCreate: saveNewTicket, onManual: newTicketDialog });
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }
  catch { toast('Não foi possível salvar no navegador. Suas alterações estão disponíveis nesta sessão.', 'alert'); }
}
function toast(message, type = 'check') {
  const element = document.createElement('div');
  element.className = 'toast';
  element.innerHTML = `${icon(type)}<span>${esc(message)}</span>`;
  document.querySelector('#toast-region').append(element);
  setTimeout(() => element.remove(), 5500);
}
function render() {
  const counts = metrics(visibleTickets());
  const isRequester = state.role === 'requester';
  app.innerHTML = `
    <button class="sidebar-backdrop ${state.mobileOpen ? 'visible' : ''}" data-action="close-menu" aria-label="Fechar menu"></button>
    <aside class="sidebar ${state.mobileOpen ? 'is-open' : ''}" aria-label="Menu principal">
      <a class="brand" href="#chamados" data-route="tickets"><span class="brand-mark">${icon('shield')}</span><span>GOVSAFE <strong>360</strong><small>CENTRAL DE SERVIÇOS</small></span></a>
      <div class="workspace"><span class="workspace-mark">${icon('monitor')}</span><span>Service desk<small>Ambiente de demonstração</small></span><span class="workspace-dot"></span></div>
      <div class="nav-label">PRINCIPAL</div>
      <nav class="nav-list">
        <button class="nav-item ${state.page === 'overview' ? 'active' : ''}" data-route="overview" ${state.page === 'overview' ? 'aria-current="page"' : ''}>${icon('grid')}<span>Visão geral</span></button>
        <button class="nav-item ${state.page === 'tickets' && state.scope !== 'mine' ? 'active' : ''}" data-route="tickets" ${state.page === 'tickets' && state.scope !== 'mine' ? 'aria-current="page"' : ''}>${icon('ticket')}<span>Chamados</span><span class="nav-count">${counts.total}</span></button>
        <button class="nav-item ${state.page === 'tickets' && state.scope === 'mine' ? 'active' : ''}" data-route="mine" ${state.page === 'tickets' && state.scope === 'mine' ? 'aria-current="page"' : ''}>${icon('user')}<span>Meus chamados</span></button>
        ${!isRequester ? `<button class="nav-item ${state.page === 'teams' ? 'active' : ''}" data-route="teams" ${state.page === 'teams' ? 'aria-current="page"' : ''}>${icon('users')}<span>Equipes</span><span class="nav-sub-count">3</span></button>` : ''}
        <div class="nav-label nav-label-second">CONHECIMENTO</div>
        <button class="nav-item ${state.page === 'knowledge' ? 'active' : ''}" data-route="knowledge" ${state.page === 'knowledge' ? 'aria-current="page"' : ''}>${icon('book')}<span>Base de conhecimento</span></button>
      </nav>
      <div class="sidebar-bottom">
        <div class="help-card"><span class="help-icon">${icon('spark')}</span><h3>Podemos ajudar?</h3><p>Encontre orientações para resolver dúvidas do dia a dia.</p><button data-route="knowledge">Explorar a base ${icon('arrow')}</button></div>
        <button class="nav-item" data-action="settings">${icon('settings')}<span>Preferências</span></button>
        <div class="academic-note"><span class="demo-dot"></span>Projeto acadêmico <span>v1.0</span></div>
      </div>
    </aside>
    <div class="app-body">
      <header class="topbar">
        <div class="breadcrumb"><button class="icon-button mobile-toggle" data-action="menu" aria-label="${state.mobileOpen ? 'Fechar menu' : 'Abrir menu'}" aria-expanded="${state.mobileOpen}">${icon('menu')}</button><span class="breadcrumb-home">Workspace</span>${icon('chevron')}<strong>${({ tickets: state.scope === 'mine' ? 'Meus chamados' : 'Chamados', overview: 'Visão geral', teams: 'Equipes', knowledge: 'Base de conhecimento' })[state.page]}</strong></div>
        <div class="topbar-actions"><span class="demo-label"><span></span>Modo demonstração</span><button class="icon-button" data-action="global-search" aria-label="Buscar chamados">${icon('search')}</button><div class="notification-wrap"><button class="icon-button notification-button" data-action="notifications" aria-label="Ver atividades recentes" aria-expanded="false">${icon('bell')}<i></i></button><div class="notification-popover" id="notification-popover" hidden></div></div><span class="topbar-divider"></span><button class="profile-button" data-action="profile" aria-label="Trocar perfil de demonstração">${avatar(CURRENT_USER)}<span><strong>Bruno Fonteles</strong><small>${isRequester ? 'Solicitante' : 'Equipe de TI'}</small></span>${icon('down')}</button></div>
      </header>
      <main id="main-content" tabindex="-1"></main>
      <footer class="page-footer"><span>GOVSAFE 360 <span class="footer-dot">·</span> Central de serviços de TI</span><span>Projeto didático independente <span class="footer-dot">·</span> Dados fictícios</span></footer>
    </div>`;
  renderMain();
}
function pageHeading(eyebrow, title, subtitle, actions = true) {
  return `<section class="page-heading"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${actions ? `<button class="button button-primary" data-action="new-ticket">${icon('plus')}Novo chamado</button>` : ''}</section>`;
}
function statCards() {
  const m = metrics(visibleTickets());
  return `<section class="stat-grid" aria-label="Resumo dos chamados">${[
    ['Total de chamados', m.total, 'ticket', 'total', 'Todos os registros', ''],
    ['Em aberto', m.open, 'inbox', 'open', 'Prontos para a triagem', 'Aberto'],
    ['Em atendimento', m.progress, 'clock', 'progress', 'Nossa equipe está cuidando', 'Em atendimento'],
    ['Resolvidos', m.resolved, 'circleCheck', 'resolved', 'Atendimentos concluídos', 'Resolvido']
  ].map(([label, value, name, style, description, status]) => `<button class="stat-card ${style}" data-stat="${esc(status)}"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon(name)}</span></div><strong class="stat-value">${String(value).padStart(2, '0')}</strong><div class="stat-bottom"><span class="mini-dot"></span>${description}</div></button>`).join('')}</section>`;
}
function renderMain() {
  const main = document.querySelector('#main-content');
  document.title = `${({ tickets: 'Chamados', overview: 'Visão geral', teams: 'Equipes', knowledge: 'Base de conhecimento' })[state.page]} · GOVSAFE 360`;
  if (state.page === 'tickets') {
    main.innerHTML = pageHeading('SEU PONTO DE CONEXÃO COM A TI', state.scope === 'mine' ? 'Meus chamados' : 'Central de chamados', 'Tudo o que você precisa para um atendimento mais simples e conectado.') + statCards() + ticketSection() + `<div class="bottom-grid">${teamSummary()}${recentActivity()}</div>`;
    renderResults();
  } else if (state.page === 'overview') {
    main.innerHTML = pageHeading('ACOMPANHE O QUE IMPORTA', 'Uma visão de todo o atendimento', 'Pessoas, equipes e solicitações conectadas em um só lugar.') + statCards() + overviewContent();
  } else if (state.page === 'teams') {
    main.innerHTML = pageHeading('CADA SOLICITAÇÃO NO LUGAR CERTO', 'Nossas equipes', 'Conheça as especialidades e encaminhe cada chamado para quem pode ajudar.') + `<div class="team-grid">${TEAMS.map(teamCard).join('')}</div><div class="info-banner">${icon('shield')}<div><strong>Autonomia com rastreabilidade</strong><p>Encaminhamentos, atribuições e mudanças de status ficam registrados no histórico de cada chamado.</p></div></div>`;
  } else main.innerHTML = knowledgeContent();
}
function ticketSection() {
  const mine = tickets.filter(t => t.requester === CURRENT_USER).length;
  return `<section class="ticket-panel" aria-label="Lista de chamados"><div class="ticket-panel-top"><div class="tabs" role="group" aria-label="Escopo dos chamados">${[
    ['all', 'Todos os chamados', visibleTickets().length], ['mine', 'Meus chamados', mine], ...(state.role === 'agent' ? [['unassigned', 'Não atribuídos', tickets.filter(t => !t.assignee).length]] : []), ['resolved', 'Resolvidos', metrics(visibleTickets()).resolved]
  ].map(([scope, label, count]) => `<button class="tab ${state.scope === scope ? 'active' : ''}" data-scope="${scope}" aria-pressed="${state.scope === scope}">${label}<span>${count}</span></button>`).join('')}</div><button class="icon-button export-button" data-action="export-csv" title="Exportar chamados filtrados" aria-label="Exportar chamados filtrados em CSV">${icon('download')}</button></div>
    <div class="ticket-toolbar"><label class="search-field">${icon('search')}<input id="ticket-search" type="search" placeholder="Buscar por assunto, número ou solicitante..." value="${esc(state.search)}" aria-label="Buscar chamados" /><kbd>/</kbd></label><div class="toolbar-right"><button class="button button-outline filter-button ${state.filtersOpen || state.status || state.priority || state.category || state.team ? 'is-filtered' : ''}" data-action="filters" aria-expanded="${state.filtersOpen}">${icon('filter')}Filtros${[state.status, state.priority, state.category, state.team].filter(Boolean).length ? `<span class="filter-count">${[state.status, state.priority, state.category, state.team].filter(Boolean).length}</span>` : ''}</button><label class="sort-field"><span class="sr-only">Ordenar chamados</span><select id="sort-select">${options(['recent', 'oldest', 'priority'], state.sort).replace('>recent<', '>Mais recentes<').replace('>oldest<', '>Mais antigos<').replace('>priority<', '>Prioridade<')}</select></label><div class="view-toggle" role="group" aria-label="Visualização"><button class="${state.view === 'list' ? 'active' : ''}" data-view="list" aria-label="Visualizar em lista" aria-pressed="${state.view === 'list'}">${icon('list')}</button><button class="${state.view === 'board' ? 'active' : ''}" data-view="board" aria-label="Visualizar em quadro" aria-pressed="${state.view === 'board'}">${icon('board')}</button></div></div></div>
    ${state.filtersOpen ? `<div class="filters-panel"><label>Status<select data-filter="status">${options(STATUSES, state.status, 'Todos os status')}</select></label><label>Prioridade<select data-filter="priority">${options(PRIORITIES, state.priority, 'Todas as prioridades')}</select></label><label>Categoria<select data-filter="category">${options(CATEGORIES, state.category, 'Todas as categorias')}</select></label><label>Equipe<select data-filter="team">${options(TEAMS.map(t => t.name), state.team, 'Todas as equipes')}</select></label><button class="text-button" data-action="clear-filters">Limpar filtros</button></div>` : ''}<div id="ticket-results" aria-live="polite"></div></section>`;
}
function renderResults() {
  const filtered = filterTickets(visibleTickets(), state);
  const target = document.querySelector('#ticket-results');
  if (!target) return;
  if (!filtered.length) {
    target.innerHTML = `<div class="empty-state"><span>${icon('search')}</span><h3>Nenhum chamado por aqui</h3><p>Tente outro termo ou limpe os filtros para encontrar o que procura.</p><button class="button button-outline" data-action="clear-filters">Limpar busca e filtros</button></div>`; return;
  }
  if (state.view === 'board') {
    target.innerHTML = `<p class="board-hint">${icon('activity')}Acompanhe o fluxo de atendimento. Abra um cartão para atualizar ou encaminhar.</p><div class="kanban">${STATUSES.map(status => {
      const items = filtered.filter(t => t.status === status);
      return `<section class="kanban-column"><div class="kanban-title"><span class="status-dot ${statusClass(status)}"></span><h3>${esc(status)}</h3><span>${items.length}</span></div><div class="kanban-cards">${items.map(t => `<button class="kanban-card" data-ticket="${t.id}"><span class="kanban-card-top"><span class="ticket-number">#TI-${t.id}</span>${priority(t.priority)}</span><strong>${esc(t.title)}</strong><span class="category-tag">${icon(categoryIcon(t.category))}${esc(t.category)}</span><span class="kanban-card-bottom">${t.assignee ? `<span class="assignee">${avatar(t.assignee, true)}${esc(t.assignee.split(' ')[0])}</span>` : '<span class="unassigned">Não atribuído</span>'}<span>${relativeDate(t.updatedAt)}</span></span></button>`).join('') || '<p class="kanban-empty">Nenhum chamado</p>'}</div></section>`;
    }).join('')}</div><div class="table-footer"><span>${filtered.length} chamado${filtered.length !== 1 ? 's' : ''} no quadro</span><span class="live-note"><span></span>Salvo neste navegador</span></div>`;
    return;
  }
  const pages = Math.ceil(filtered.length / 6);
  state.currentPage = Math.min(state.currentPage, pages);
  const start = (state.currentPage - 1) * 6;
  target.innerHTML = `<div class="table-scroll"><table class="tickets-table"><thead><tr><th scope="col" class="ticket-column">CHAMADO / ASSUNTO</th><th scope="col">CATEGORIA</th><th scope="col">STATUS</th><th scope="col">PRIORIDADE</th><th scope="col">RESPONSÁVEL</th><th scope="col" class="updated-column">ATUALIZAÇÃO</th><th scope="col"><span class="sr-only">Abrir chamado</span></th></tr></thead><tbody>${filtered.slice(start, start + 6).map(t => `<tr data-row-ticket="${t.id}"><td><div class="ticket-cell"><span class="ticket-type-icon">${icon(categoryIcon(t.category))}</span><div><button class="ticket-title" data-ticket="${t.id}">${esc(t.title)}</button><div class="ticket-meta"><span>#TI-${t.id}</span><span>·</span><span>${esc(t.requester)}</span></div></div></div></td><td><span class="category-text">${esc(t.category)}</span></td><td>${badge(t.status)}</td><td>${priority(t.priority)}</td><td>${t.assignee ? `<span class="assignee">${avatar(t.assignee, true)}<span>${esc(t.assignee.split(' ')[0])}</span></span>` : `<span class="unassigned">${icon('user')}Não atribuído</span>`}</td><td><time class="updated-time" datetime="${esc(t.updatedAt)}" title="${fullDate(t.updatedAt)}">${relativeDate(t.updatedAt)}</time></td><td><button class="icon-button row-open" data-ticket="${t.id}" aria-label="Abrir chamado TI-${t.id}">${icon('chevron')}</button></td></tr>`).join('')}</tbody></table></div><div class="table-footer"><span>Mostrando <strong>${start + 1}–${Math.min(start + 6, filtered.length)}</strong> de <strong>${filtered.length}</strong> chamados</span><div class="pagination"><button data-pagination="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="Página anterior">${icon('left')}</button>${Array.from({ length: pages }, (_, i) => `<button data-pagination="${i + 1}" class="${state.currentPage === i + 1 ? 'active' : ''}" ${state.currentPage === i + 1 ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('')}<button data-pagination="${state.currentPage + 1}" ${state.currentPage === pages ? 'disabled' : ''} aria-label="Próxima página">${icon('chevron')}</button></div></div>`;
}
function teamSummary() {
  return `<section class="summary-panel"><div class="panel-heading"><h2>${state.role === 'requester' ? 'Quem cuida do seu chamado' : 'Chamados por equipe'}</h2>${state.role === 'agent' ? '<button class="text-button" data-route="teams">Ver equipes</button>' : icon('users')}</div><div class="team-summary-list">${TEAMS.map(team => {
    const total = visibleTickets().filter(t => t.team === team.name && t.status !== 'Resolvido').length;
    return `<button class="team-summary-row" data-team="${esc(team.name)}"><span class="team-icon ${team.color}">${icon(team.icon)}</span><span class="team-summary-info"><strong>${esc(team.name)}</strong><span class="progress-track"><span class="${team.color}" style="width:${Math.min(100, total / Math.max(1, visibleTickets().filter(t => t.status !== 'Resolvido').length) * 100)}%"></span></span></span><span class="team-total">${String(total).padStart(2, '0')}<small>ativos</small></span>${icon('chevron')}</button>`;
  }).join('')}</div></section>`;
}
function recentActivity() {
  const activity = visibleTickets().flatMap(t => t.history.map(h => ({ ...h, ticket: t.id }))).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  return `<section class="summary-panel activity-panel"><div class="panel-heading"><h2>Últimas movimentações</h2><span class="subtle-label">${icon('activity')}Em dia com a equipe</span></div><div class="activity-list">${activity.map((item, i) => `<button class="activity-item" data-ticket="${item.ticket}"><span class="activity-line-icon ${i === 0 ? 'green' : ''}">${icon(item.text.startsWith('Chamado') ? 'plus' : 'arrow')}</span><span><strong>${esc(item.text)}</strong><small><b>#TI-${item.ticket}</b><span>·</span>${esc(item.actor)}</small></span><time title="${fullDate(item.date)}">${relativeDate(item.date)}</time></button>`).join('') || '<p class="muted">Nenhuma movimentação.</p>'}</div></section>`;
}
function overviewContent() {
  const m = metrics(visibleTickets());
  return `<div class="bottom-grid overview-grid"><section class="summary-panel"><div class="panel-heading"><h2>Fluxo de atendimento</h2><span class="subtle-label">Todos os registros</span></div><div class="status-breakdown">${STATUSES.map(status => { const count = visibleTickets().filter(t => t.status === status).length; return `<button data-stat="${esc(status)}"><span>${badge(status)}<b>${count}</b></span><span class="wide-track"><i class="${statusClass(status)}" style="width:${count / Math.max(m.total, 1) * 100}%"></i></span></button>`; }).join('')}</div></section>${teamSummary()}<section class="summary-panel"><div class="panel-heading"><h2>Solicitações por categoria</h2>${icon('folder')}</div><div class="category-breakdown">${CATEGORIES.map(category => `<button data-category="${esc(category)}"><span>${icon(categoryIcon(category))}${esc(category)}</span><strong>${visibleTickets().filter(t => t.category === category).length}</strong></button>`).join('')}</div></section>${recentActivity()}</div>`;
}
function teamCard(team) {
  const own = tickets.filter(t => t.team === team.name);
  return `<section class="team-card"><span class="team-icon large ${team.color}">${icon(team.icon)}</span><h2>${esc(team.name)}</h2><p>${esc(team.description)}</p><div class="team-card-metrics"><div><strong>${own.filter(t => t.status !== 'Resolvido').length}</strong><small>Chamados ativos</small></div><div><strong>${team.members.length}</strong><small>Integrantes</small></div></div><div class="team-members">${team.members.map(name => `<div>${avatar(name, true)}<span>${esc(name)}</span><span class="member-dot" title="Integrante da equipe"></span></div>`).join('')}</div><button class="button button-outline" data-team="${esc(team.name)}">Ver chamados da equipe${icon('arrow')}</button></section>`;
}
const articles = [
  { title: 'Como abrir um bom chamado de TI', category: 'Primeiros passos', icon: 'ticket', description: 'As informações certas ajudam nossa equipe a atender você mais rápido.', paragraphs: ['Use um assunto curto que descreva o problema, como “Impressora do setor sem conexão”. Selecione a categoria mais próxima da sua necessidade.', 'Na descrição, informe o que aconteceu, quando começou, qual equipamento está envolvido e quais tentativas você já fez. Nunca inclua senhas ou informações pessoais sensíveis.', 'Escolha a prioridade de acordo com o impacto. Urgente se aplica a uma interrupção que impede várias pessoas de trabalhar. A equipe pode reavaliar a prioridade durante a triagem.', 'Depois de criar, acompanhe o chamado em “Meus chamados”. Você pode acrescentar informações pelos comentários. Neste protótipo, todos os dados permanecem apenas no seu navegador.'] },
  { title: 'Problemas de conexão com a internet', category: 'Rede e internet', icon: 'network', description: 'Faça algumas verificações simples antes de solicitar atendimento.', paragraphs: ['Confira se o cabo de rede está conectado ou se o Wi-Fi está ativado. Verifique se o problema acontece em apenas um equipamento ou com outras pessoas do setor.', 'Salve seu trabalho antes de reiniciar o computador. Evite alterar configurações de rede ou reiniciar equipamentos compartilhados sem orientação da equipe de TI.', 'Se a conexão continuar indisponível, abra um chamado na categoria “Rede e internet”. Informe o local, o horário aproximado e se outras pessoas também são afetadas.'] },
  { title: 'Solicitar acesso a um sistema', category: 'Acessos', icon: 'key', description: 'Saiba quais dados informar para solicitar uma nova permissão.', paragraphs: ['Crie um chamado na categoria “Acessos” e escolha a equipe “Sistemas e acessos”. Informe o nome do sistema e o tipo de acesso necessário.', 'Descreva a atividade que depende dessa permissão e qual setor faz a solicitação. Quando necessário, a equipe poderá pedir a aprovação da pessoa responsável.', 'Nunca informe sua senha nos comentários. A demonstração não concede permissões reais nem faz qualquer integração com sistemas institucionais.'] },
  { title: 'Entenda os status do seu chamado', category: 'Primeiros passos', icon: 'activity', description: 'Do primeiro contato até a solução: entenda cada etapa do atendimento.', paragraphs: ['Aberto: sua solicitação foi registrada e aguarda triagem ou início do atendimento.', 'Em atendimento: uma pessoa da equipe está trabalhando na solicitação.', 'Aguardando: o atendimento depende de uma informação, validação ou ação adicional. Consulte os comentários para entender o próximo passo.', 'Resolvido: a equipe registrou a conclusão. O histórico do atendimento continua disponível para consulta.'] },
  { title: 'Impressora offline ou sem imprimir', category: 'Impressoras', icon: 'printer', description: 'Confira papel, conexão e fila de impressão com segurança.', paragraphs: ['Confira se a impressora está ligada, conectada e com papel. Observe se existe alguma mensagem de erro no painel.', 'Verifique se você selecionou a impressora correta. Não remova documentos de outras pessoas da fila e não desmonte o equipamento.', 'Se o problema persistir, registre um chamado com a localização da impressora, a mensagem de erro e o impacto no setor.'] },
  { title: 'Como funciona esta demonstração', category: 'Sobre o projeto', icon: 'shield', description: 'Conheça o escopo acadêmico, os dados locais e os perfis simulados.', paragraphs: ['O GOVSAFE 360 é um projeto didático de front-end para abertura e atendimento de chamados de TI. É independente do SIGD e não possui vínculo, autorização ou integração com a SEMA.', 'Os perfis “Solicitante” e “Equipe de TI” são visões simuladas da interface. Não existe autenticação ou controle de acesso real.', 'Os dados são fictícios e armazenados no localStorage deste navegador. Não são compartilhados entre dispositivos e podem ser apagados ao limpar os dados do site.', 'Anexos guardam somente nome e tamanho do arquivo. O conteúdo não é enviado nem armazenado. Você pode exportar os registros ou restaurar a demonstração em Preferências.'] }
];
function knowledgeContent() {
  return pageHeading('RESPOSTAS QUE FACILITAM SEU DIA', 'Como podemos ajudar?', 'Orientações práticas para você resolver dúvidas e aproveitar melhor o atendimento.', false) + `<div class="knowledge-search"><label class="search-field">${icon('search')}<input id="knowledge-search" type="search" placeholder="Busque uma orientação..." value="${esc(state.knowledgeSearch)}" aria-label="Buscar na base de conhecimento" /></label><span>6 orientações para começar</span></div><div class="article-grid" id="article-results">${articleCards()}</div><div class="knowledge-callout"><span class="team-icon green">${icon('help')}</span><div><h2>Não encontrou o que precisava?</h2><p>Nossa equipe está aqui para ajudar. Conte o que está acontecendo.</p></div><button class="button button-primary" data-action="new-ticket">Abrir um chamado${icon('arrow')}</button></div>`;
}
function articleCards() {
  const results = articles.map((article, index) => ({ ...article, index })).filter(article => normalize(article.title + article.category + article.description).includes(normalize(state.knowledgeSearch)));
  return results.map(a => `<button class="article-card" data-article="${a.index}"><span class="article-icon">${icon(a.icon)}</span><span class="article-category">${esc(a.category)}</span><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p><span class="article-link">Ler orientação${icon('arrow')}</span></button>`).join('') || '<div class="empty-state"><h3>Nenhuma orientação encontrada</h3><p>Tente buscar por acesso, internet ou chamado.</p></div>';
}
function openDialog(content, className = '') {
  if (dialog.open) dialog.close();
  dialog.className = className;
  dialog.innerHTML = content;
  dialog.showModal();
}
const dialogHeader = (eyebrow, title, subtitle = '') => `<div class="dialog-header"><div><span class="eyebrow">${esc(eyebrow)}</span><h2 id="dialog-title">${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div><button class="icon-button" data-action="close-dialog" aria-label="Fechar janela">${icon('close')}</button></div>`;
function ticketCreationChoice() {
  openDialog(`${dialogHeader('DO SEU JEITO', 'Como você prefere abrir seu chamado?', 'Você não precisa saber o nome técnico do problema.')}<div class="dialog-content creation-options"><button class="creation-option creation-option-assisted" data-action="assistant"><span class="creation-option-icon">${icon('spark')}</span><span><span class="creation-option-label">Assistente de TI <small>SIMULAÇÃO DE IA</small></span><strong>Conte o problema em uma conversa</strong><span>Responda perguntas simples e receba sugestões de categoria, prioridade, dificuldade e equipe.</span><b>Começar conversa ${icon('arrow')}</b></span></button><button class="creation-option" data-action="manual-ticket"><span class="creation-option-icon">${icon('ticket')}</span><span><strong>Preencher formulário</strong><span>Já sabe o que precisa? Informe os dados e abra o chamado diretamente.</span><b>Abrir formulário ${icon('arrow')}</b></span></button><p class="creation-note">A classificação sugerida pode ser revisada por você e pela equipe de TI.</p></div>`, 'creation-choice-dialog');
}
function newTicketDialog(prefill = {}) {
  openDialog(`${dialogHeader('VAMOS RESOLVER JUNTOS', 'Novo chamado', 'Conte o que você precisa. Nossa equipe cuida do próximo passo.')}<form id="new-ticket-form"><div class="dialog-content form-grid"><label class="full-width">Assunto <span class="required">*</span><input name="title" placeholder="Resuma sua solicitação em uma frase" minlength="5" maxlength="120" required autofocus /></label><label>Categoria <span class="required">*</span><select name="category" required><option value="">Selecione uma categoria</option>${options(CATEGORIES)}</select></label><label>Prioridade <span class="required">*</span><select name="priority" required>${options(PRIORITIES, 'Média')}</select></label><label>Setor solicitante <span class="required">*</span><input name="department" placeholder="Ex.: Administrativo" maxlength="100" required /></label><label>Encaminhar para <span class="required">*</span><select name="team" required>${options(TEAMS.map(t => t.name), 'Suporte técnico')}</select></label><label class="full-width">Descrição <span class="required">*</span><textarea name="description" rows="4" minlength="15" maxlength="4000" placeholder="O que aconteceu? Quando começou? Quais tentativas você já fez?" required></textarea><span class="field-hint">Não inclua senhas ou informações pessoais sensíveis.</span></label><div class="full-width"><label class="file-drop" for="attachments">${icon('paperclip')}<strong>Adicionar referência de anexo</strong><span>Até 3 arquivos de 5 MB. Somente nome e tamanho serão guardados.</span><input id="attachments" name="attachments" type="file" multiple aria-describedby="attachment-list" /></label><p id="attachment-list" class="field-hint" aria-live="polite"></p></div><div class="form-info full-width">${icon('user')}Solicitação em nome de <strong>${CURRENT_USER}</strong></div><p id="form-error" class="form-error full-width" role="alert"></p></div><div class="dialog-footer"><span><span class="required">*</span> Campos obrigatórios</span><div><button type="button" class="button button-outline" data-action="close-dialog">Cancelar</button><button class="button button-primary" type="submit">${icon('plus')}Criar chamado</button></div></div></form>`);
  for (const key of ['title', 'category', 'priority', 'department', 'team', 'description']) {
    if (prefill[key]) dialog.querySelector('#new-ticket-form').elements[key].value = prefill[key];
  }
}
function saveNewTicket(data) {
  const ticket = createTicket(data, tickets);
  tickets.unshift(ticket); persist(); dialog.close(); route('tickets');
  toast(`Chamado #TI-${ticket.id} criado e encaminhado para ${ticket.team}.`);
  detailDialog(ticket.id);
}
function assistantInsight(ticket) {
  if (!ticket.aiAnalysis) return '';
  const analysis = ticket.aiAnalysis;
  return `<section class="ai-insight" aria-label="Sugestão de resolução do assistente"><div class="ai-insight-heading"><span>${icon('spark')}</span><div><h3>Dica inicial de resolução</h3><p>Assistente de TI · IA simulada</p></div><span class="ai-demo-pill">DEMONSTRAÇÃO</span></div><p>Confira estas orientações para ${esc((analysis.tipCategory || analysis.category).toLowerCase())}. A causa e a solução precisam ser validadas pela equipe.</p><ol>${analysis.tipSteps.map(step => `<li>${esc(step)}</li>`).join('')}</ol><details><summary>Como a classificação foi sugerida</summary><p><strong>Categoria inicial: ${esc(analysis.category)}.</strong> ${esc(analysis.categoryReason)}</p><p><strong>Prioridade inicial: ${esc(analysis.priority)}.</strong> ${esc(analysis.priorityReason)}</p><p><strong>Dificuldade inicial: ${esc(analysis.difficulty)}.</strong> ${esc(analysis.difficultyReason)}</p><p>O solicitante revisou o resumo antes de criar. A classificação atual pode incluir ajustes humanos.</p></details></section>`;
}
function detailDialog(id, activeTab = 'conversation') {
  const ticket = visibleTickets().find(t => t.id === id);
  if (!ticket) return;
  const team = TEAMS.find(t => t.name === ticket.team);
  openDialog(`${dialogHeader(`#TI-${ticket.id} · ${ticket.category}`, ticket.title)}<div class="detail-content"><div class="detail-status-row">${badge(ticket.status)}${priority(ticket.priority)}<span>${icon('clock')}Criado em ${fullDate(ticket.createdAt)}</span></div><div class="requester-card">${avatar(ticket.requester)}<div><strong>${esc(ticket.requester)}</strong><small>${esc(ticket.department)} · Solicitante</small></div></div><section class="description-section"><h3>Descrição da solicitação</h3><p>${esc(ticket.description)}</p>${ticket.attachments.length ? `<div class="attachments">${ticket.attachments.map(a => `<span>${icon('paperclip')}<span>${esc(a.name)}<small>${Math.round(a.size / 1024)} KB · referência local</small></span></span>`).join('')}</div>` : ''}</section>
    <div class="ticket-difficulty"><span>Dificuldade estimada</span><strong>${esc(ticket.difficulty || 'A avaliar')}</strong>${ticket.aiAnalysis ? '<small>Abertura com assistente demonstrativo</small>' : ''}</div>${assistantInsight(ticket)}
    ${state.role === 'agent' ? `<form id="ticket-update-form" data-id="${id}" class="assignment-form"><div class="section-title">${icon('users')}Organização e encaminhamento</div><div class="form-grid"><label>Status<select name="status">${options(STATUSES, ticket.status)}</select></label><label>Prioridade<select name="priority">${options(PRIORITIES, ticket.priority)}</select></label><label>Equipe<select name="team" id="detail-team">${options(TEAMS.map(t => t.name), ticket.team)}</select></label><label>Responsável<select name="assignee" id="detail-assignee">${options(team.members, ticket.assignee, 'Não atribuído')}</select></label><label>Dificuldade estimada<select name="difficulty">${options(DIFFICULTIES, ticket.difficulty || 'A avaliar')}</select></label></div><div class="assignment-footer"><span>Alterações registradas no histórico</span><button class="button button-primary button-small" type="submit">${icon('check')}Salvar alterações</button></div><p class="form-error" id="update-error" role="alert"></p></form>` : `<div class="requester-assignment"><span>${icon('users')}<strong>${esc(ticket.team)}</strong></span><span>Responsável: ${esc(ticket.assignee || 'Aguardando atribuição')}</span></div>`}
    <div class="detail-tabs" role="group" aria-label="Informações do chamado"><button class="${activeTab === 'conversation' ? 'active' : ''}" data-detail-tab="conversation" data-id="${id}">Conversa<span>${ticket.comments.length}</span></button><button class="${activeTab === 'history' ? 'active' : ''}" data-detail-tab="history" data-id="${id}">Histórico<span>${ticket.history.length}</span></button></div>
    ${activeTab === 'history' ? `<div class="history-list">${[...ticket.history].reverse().map(h => `<div class="history-item"><span class="history-dot"></span><div><strong>${esc(h.text)}</strong><small>${esc(h.actor)} · ${fullDate(h.date)}</small></div></div>`).join('')}</div>` : `<div class="comments-list">${ticket.comments.length ? ticket.comments.map(c => `<div class="comment">${avatar(c.author, true)}<div><div class="comment-heading"><strong>${esc(c.author)}</strong><time>${fullDate(c.date)}</time></div><p>${esc(c.body)}</p></div></div>`).join('') : `<div class="conversation-empty">${icon('send')}<strong>O atendimento começa com uma conversa</strong><p>Adicione informações ou deixe uma mensagem para a equipe.</p></div>`}</div><form id="comment-form" data-id="${id}" class="comment-form"><label for="comment-body" class="sr-only">Mensagem para o chamado</label><textarea id="comment-body" name="body" rows="3" placeholder="Escreva uma mensagem..." maxlength="2000" required></textarea><div><span>Visível aos dois perfis da demonstração</span><button class="button button-primary button-small" type="submit">Enviar${icon('send')}</button></div><p class="form-error" id="comment-error" role="alert"></p></form>`}</div><div class="detail-bottom">${icon('shield')}Ambiente acadêmico · Dados salvos somente neste navegador</div>`, 'detail-dialog');
}
function profileDialog() {
  openDialog(`${dialogHeader('EXPLORE OS DOIS LADOS', 'Trocar visão', 'Escolha como deseja navegar pela demonstração.')}<div class="dialog-content profile-options"><button class="profile-option ${state.role === 'agent' ? 'selected' : ''}" data-role="agent">${icon('users')}<span><strong>Equipe de TI</strong><small>Organize a fila, atribua responsáveis e encaminhe chamados.</small></span>${state.role === 'agent' ? icon('circleCheck') : icon('chevron')}</button><button class="profile-option ${state.role === 'requester' ? 'selected' : ''}" data-role="requester">${icon('user')}<span><strong>Solicitante</strong><small>Abra chamados, acompanhe solicitações e converse com a equipe.</small></span>${state.role === 'requester' ? icon('circleCheck') : icon('chevron')}</button><div class="inline-notice">${icon('shield')}Perfis simulados para apresentação. Não há autenticação nem controle de acesso real.</div></div>`, 'small-dialog');
}
function settingsDialog() {
  openDialog(`${dialogHeader('SEU AMBIENTE', 'Preferências da demonstração')}<div class="dialog-content settings-content"><div class="settings-section"><span class="team-icon green">${icon('users')}</span><div><h3>Perfil de demonstração</h3><p>Você está na visão ${state.role === 'agent' ? 'da equipe de TI' : 'do solicitante'}.</p><button class="button button-outline button-small" data-action="profile">Trocar visão</button></div></div><div class="settings-section"><span class="team-icon blue">${icon('download')}</span><div><h3>Seus dados, no seu navegador</h3><p>Exporte os chamados, comentários e histórico em um arquivo JSON.</p><button class="button button-outline button-small" data-action="export-json">Exportar dados</button></div></div><div class="settings-section"><span class="team-icon amber">${icon('refresh')}</span><div><h3>Recomeçar a apresentação</h3><p>Restaurar os 12 chamados fictícios remove as alterações feitas neste navegador.</p><button class="button button-outline button-small" data-action="confirm-reset">Restaurar demonstração</button></div></div><div class="inline-notice">${icon('shield')}Projeto didático independente, sem vínculo ou autorização da SEMA. Nenhum chamado é enviado a uma equipe real.</div></div>`, 'small-dialog');
}
function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function clearFilters() {
  Object.assign(state, { search: '', status: '', priority: '', category: '', team: '', scope: 'all', currentPage: 1 });
  render();
}
function route(page) {
  state.page = page === 'mine' ? 'tickets' : page;
  state.scope = page === 'mine' ? 'mine' : 'all';
  Object.assign(state, { mobileOpen: false, search: '', status: '', priority: '', category: '', team: '', currentPage: 1 });
  render(); window.scrollTo({ top: 0, behavior: 'instant' });
}
function filterBy(key, value) {
  route('tickets'); state[key] = value; state.filtersOpen = Boolean(value); renderMain();
}
document.addEventListener('click', event => {
  const target = event.target.closest('button, a[data-route]');
  if (target?.dataset.route) { event.preventDefault(); route(target.dataset.route); return; }
  if (target?.dataset.ticket) { detailDialog(Number(target.dataset.ticket)); return; }
  if (target?.dataset.scope) { state.scope = target.dataset.scope; state.currentPage = 1; render(); return; }
  if (target?.dataset.view) { state.view = target.dataset.view; state.currentPage = 1; renderMain(); return; }
  if (target?.dataset.pagination) { state.currentPage = Number(target.dataset.pagination); renderResults(); return; }
  if (target?.hasAttribute('data-stat')) { filterBy('status', target.dataset.stat); return; }
  if (target?.dataset.team) { filterBy('team', target.dataset.team); return; }
  if (target?.dataset.category) { filterBy('category', target.dataset.category); return; }
  if (target?.dataset.article) {
    const article = articles[Number(target.dataset.article)];
    openDialog(`${dialogHeader(article.category, article.title)}<article class="dialog-content article-body">${article.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</article><div class="dialog-footer"><span>Base de conhecimento · GOVSAFE 360</span><button class="button button-primary" data-action="close-dialog">Entendi${icon('check')}</button></div>`); return;
  }
  if (target?.dataset.detailTab) { detailDialog(Number(target.dataset.id), target.dataset.detailTab); return; }
  if (target?.dataset.role) {
    state.role = target.dataset.role; dialog.close(); route('tickets');
    toast(`Visão alterada para ${state.role === 'agent' ? 'equipe de TI' : 'solicitante'}.`); return;
  }
  switch (target?.dataset.action) {
    case 'new-ticket': ticketCreationChoice(); break;
    case 'manual-ticket': newTicketDialog(); break;
    case 'assistant': assistant.open(); break;
    case 'close-dialog': dialog.close(); break;
    case 'profile': profileDialog(); break;
    case 'settings': settingsDialog(); break;
    case 'menu': state.mobileOpen = !state.mobileOpen; render(); break;
    case 'close-menu': state.mobileOpen = false; render(); break;
    case 'filters': state.filtersOpen = !state.filtersOpen; renderMain(); break;
    case 'clear-filters': clearFilters(); break;
    case 'global-search': route('tickets'); document.querySelector('#ticket-search').focus(); break;
    case 'notifications': {
      const popover = document.querySelector('#notification-popover');
      popover.hidden = !popover.hidden;
      target.setAttribute('aria-expanded', String(!popover.hidden));
      if (!popover.hidden) popover.innerHTML = `<div class="popover-title"><strong>Atividades recentes</strong><small>Movimentações locais</small></div>${visibleTickets().slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3).map(t => `<button data-ticket="${t.id}">${icon('ticket')}<span><strong>${esc(t.title)}</strong><small>#TI-${t.id} · ${relativeDate(t.updatedAt)}</small></span></button>`).join('')}`;
      break;
    }
    case 'export-json': download('govsafe360-chamados.json', JSON.stringify(visibleTickets(), null, 2), 'application/json'); toast('Dados exportados em JSON.'); break;
    case 'export-csv': {
      const cell = value => `"${(/^[=+@\-\t\r]/.test(String(value)) ? "'" : '') + String(value).replace(/"/g, '""')}"`;
      const rows = [['Número', 'Assunto', 'Categoria', 'Status', 'Prioridade', 'Equipe', 'Responsável', 'Solicitante', 'Setor', 'Atualizado em'], ...filterTickets(visibleTickets(), state).map(t => [`TI-${t.id}`, t.title, t.category, t.status, t.priority, t.team, t.assignee, t.requester, t.department, fullDate(t.updatedAt)])];
      download('govsafe360-chamados.csv', '\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n'), 'text/csv;charset=utf-8'); toast('Lista filtrada exportada em CSV.'); break;
    }
    case 'confirm-reset': openDialog(`${dialogHeader('RESTAURAR DADOS', 'Recomeçar a demonstração?')}<div class="dialog-content"><p>Os chamados criados, comentários e alterações deste navegador serão removidos e substituídos pelos 12 exemplos fictícios.</p><p>Você pode exportar seus dados em Preferências antes de continuar.</p></div><div class="dialog-footer"><button class="button button-outline" data-action="settings">Voltar</button><button class="button button-danger" data-action="reset">Restaurar demonstração</button></div>`, 'small-dialog'); break;
    case 'reset': tickets = seedTickets(); persist(); dialog.close(); clearFilters(); toast('Demonstração restaurada.'); break;
    default: {
      if (!event.target.closest('.notification-wrap')) {
        const popover = document.querySelector('#notification-popover');
        if (popover) { popover.hidden = true; document.querySelector('.notification-button').setAttribute('aria-expanded', 'false'); }
      }
    }
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'ticket-search') { state.search = event.target.value; state.currentPage = 1; renderResults(); }
  if (event.target.id === 'knowledge-search') { state.knowledgeSearch = event.target.value; document.querySelector('#article-results').innerHTML = articleCards(); }
});
document.addEventListener('change', event => {
  const target = event.target;
  if (target.dataset.filter) { state[target.dataset.filter] = target.value; state.currentPage = 1; renderMain(); }
  if (target.id === 'sort-select') { state.sort = target.value; renderResults(); }
  if (target.id === 'detail-team') document.querySelector('#detail-assignee').innerHTML = options(TEAMS.find(t => t.name === target.value).members, '', 'Não atribuído');
  if (target.name === 'category' && target.closest('#new-ticket-form')) {
    target.form.elements.team.value = target.value === 'Rede e internet' ? 'Infraestrutura' : ['Software', 'Acessos'].includes(target.value) ? 'Sistemas e acessos' : 'Suporte técnico';
  }
  if (target.id === 'attachments') {
    const files = [...target.files];
    const invalid = files.length > 3 || files.some(f => f.size > 5 * 1024 * 1024);
    target.setCustomValidity(invalid ? 'Selecione até 3 arquivos, com no máximo 5 MB cada.' : '');
    document.querySelector('#attachment-list').textContent = invalid ? 'Selecione até 3 arquivos, com no máximo 5 MB cada.' : files.map(f => `${f.name} (${Math.ceil(f.size / 1024)} KB)`).join(' · ');
  }
});
document.addEventListener('submit', event => {
  const form = event.target;
  if (!['new-ticket-form', 'ticket-update-form', 'comment-form'].includes(form.id)) return;
  event.preventDefault();
  try {
    if (form.id === 'new-ticket-form') {
      const data = Object.fromEntries(new FormData(form));
      data.attachments = [...form.elements.attachments.files].map(file => ({ name: file.name, size: file.size }));
      saveNewTicket(data);
    } else if (form.id === 'ticket-update-form') {
      if (state.role !== 'agent') throw new Error('Troque para a visão da equipe de TI.');
      const id = Number(form.dataset.id);
      tickets = tickets.map(t => t.id === id ? updateTicket(t, Object.fromEntries(new FormData(form))) : t);
      persist(); renderMain(); detailDialog(id, 'history'); toast('Chamado atualizado. Alterações registradas no histórico.');
    } else {
      const id = Number(form.dataset.id);
      tickets = tickets.map(t => t.id === id ? addComment(t, new FormData(form).get('body')) : t);
      persist(); renderMain(); detailDialog(id); toast('Mensagem adicionada ao chamado.');
    }
  } catch (error) {
    const target = form.querySelector('.form-error');
    if (target) target.textContent = error.message;
  }
});
document.addEventListener('keydown', event => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if (!dialog.open && ((event.key === '/' && !typing) || ((event.ctrlKey || event.metaKey) && event.key === 'k'))) {
    event.preventDefault(); if (state.page !== 'tickets') route('tickets'); document.querySelector('#ticket-search').focus();
  }
  if (event.key === 'Escape' && state.mobileOpen) { state.mobileOpen = false; render(); }
});
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
render();
if (storageWarning) toast(storageWarning, 'alert');
