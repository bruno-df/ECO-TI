import { analyzeRequest, startConversation, replyToAssistant, quickReplies, suggestResolution } from './assistant.js';
import { CATEGORIES, PRIORITIES, DIFFICULTIES, TEAMS } from './domain.js';

export function createAssistantController({ dialog, icon, esc, options, onCreate, onManual }) {
  let conversation;
  let previous = [];
  let draft = null;
  const labels = { problem: 'Seu relato', clarify: 'Entendendo o problema', scope: 'Pessoas afetadas', impact: 'Impacto no trabalho', timing: 'Quando começou', attempts: 'O que já foi tentado', department: 'Seu setor', review: 'Revisão do chamado' };
  const progress = { problem: 1, clarify: 1, scope: 2, impact: 3, timing: 4, attempts: 5, department: 6, review: 7 };
  function open() {
    conversation = startConversation(); previous = []; draft = null;
    if (dialog.open) dialog.close();
    dialog.className = 'assistant-dialog';
    render(); dialog.showModal();
  }
  function render(focusInput = false) {
    const reviewing = conversation.stage === 'review';
    dialog.classList.toggle('is-review', reviewing);
    const analysis = analyzeRequest(conversation.answers);
    const values = draft || analysis;
    const readyPriority = Boolean(conversation.answers.impact);
    dialog.innerHTML = `
      <header class="dialog-header assistant-header"><div class="assistant-heading"><span class="assistant-mark">${icon('spark')}</span><div><span class="eyebrow">ABERTURA SIMPLIFICADA</span><h2 id="dialog-title">Assistente de TI</h2><p>Conte com suas palavras. Eu ajudo a organizar.</p></div></div><button class="icon-button" data-ai-action="close" aria-label="Fechar assistente">${icon('close')}</button></header>
      <div class="assistant-demo-note">${icon('spark')}<span><strong>IA simulada para demonstração.</strong> Respostas por regras locais, sem envio de dados a uma IA real.</span></div>
      <div class="assistant-layout"><section class="assistant-chat" aria-label="Conversa com o assistente"><div class="assistant-step"><span>Etapa ${progress[conversation.stage]} de 7</span><strong>${labels[conversation.stage]}</strong><span class="assistant-step-track"><i style="width:${progress[conversation.stage] / 7 * 100}%"></i></span></div>
        <div id="assistant-messages" class="assistant-messages" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions text">${conversation.messages.map(message => `<div class="assistant-message ${message.role}"><span class="assistant-message-avatar">${icon(message.role === 'assistant' ? 'spark' : 'user')}</span><div><span>${message.role === 'assistant' ? 'Assistente de TI · simulação' : 'Você'}</span><p>${esc(message.text)}</p></div></div>`).join('')}</div>
        ${reviewing ? `<div class="assistant-finished">${icon('circleCheck')}<div><strong>Seu relato está organizado</strong><p>Revise a sugestão de chamado antes de confirmar.</p></div></div>` : `<div class="assistant-quick-replies" role="group" aria-label="Sugestões de resposta">${quickReplies(conversation.stage).map(reply => `<button type="button" data-ai-reply="${esc(reply)}">${esc(reply)}</button>`).join('')}</div><form id="assistant-chat-form" class="assistant-composer"><label for="assistant-message-input" class="sr-only">Sua resposta para o assistente</label><textarea id="assistant-message-input" name="message" rows="2" maxlength="${conversation.stage === 'department' ? 100 : conversation.stage === 'problem' ? 1000 : 500}" placeholder="${conversation.stage === 'problem' ? 'Ex.: minha internet caiu e não consigo abrir os sistemas...' : 'Escreva sua resposta ou escolha uma sugestão...'}" required ${conversation.stage === 'problem' ? 'autofocus' : ''}></textarea><button class="button button-primary" type="submit" aria-label="Enviar resposta">${icon('send')}</button></form>`}
        <p id="assistant-error" class="form-error" role="alert"></p><div class="assistant-chat-bottom"><span>${icon('shield')}Não informe senhas ou dados sensíveis.</span><div>${previous.length ? '<button class="text-button" data-ai-action="back">Voltar uma resposta</button>' : ''}<button class="text-button" data-ai-action="restart">Recomeçar</button></div></div>
      </section><aside class="assistant-preview" aria-label="Prévia e classificação do chamado"><div class="assistant-preview-heading"><span>${icon('ticket')}</span><div><h3>${reviewing ? 'Revise seu chamado' : 'Seu chamado vai tomando forma'}</h3><p>${reviewing ? 'Você pode ajustar todos os campos.' : 'As sugestões aparecem conforme conversamos.'}</p></div></div>
        ${reviewing ? `<form id="assistant-review-form" class="assistant-review-form"><label>Assunto<input name="title" value="${esc(values.title)}" minlength="5" maxlength="120" required /></label><div class="assistant-review-grid"><label>Categoria<select name="category">${options(CATEGORIES, values.category)}</select></label><label>Prioridade sugerida<select name="priority">${options(PRIORITIES, values.priority)}</select></label><label>Dificuldade estimada<select name="difficulty">${options(DIFFICULTIES, values.difficulty)}</select></label><label>Setor<input name="department" value="${esc(values.department)}" maxlength="100" required /></label></div><label>Equipe sugerida<select name="team">${options(TEAMS.map(team => team.name), values.team)}</select></label><details class="assistant-description" open><summary>Descrição preparada</summary><label class="sr-only" for="assistant-description">Descrição do chamado</label><textarea id="assistant-description" aria-label="Descrição do chamado" name="description" rows="6" minlength="15" maxlength="4000" required>${esc(values.description)}</textarea></details><div class="assistant-reasons"><h4>Por que esta sugestão?</h4><p>${esc(analysis.categoryReason)}</p><p><strong>Prioridade:</strong> ${esc(analysis.priorityReason)}</p><p><strong>Dificuldade:</strong> ${esc(analysis.difficultyReason)}</p><small>Justificativas da sugestão inicial. A equipe de TI poderá reavaliar.</small></div><p id="assistant-review-error" class="form-error" role="alert"></p><button class="button button-primary assistant-confirm" type="submit">${icon('check')}Confirmar e criar chamado</button></form>` : `<div class="assistant-live-summary"><dl><div><dt>Categoria provável</dt><dd>${conversation.answers.problem ? esc(analysis.category) : 'Aguardando seu relato'}</dd></div><div><dt>Equipe de destino</dt><dd>${conversation.answers.problem ? esc(analysis.team) : 'A definir'}</dd></div><div><dt>Prioridade sugerida</dt><dd>${readyPriority ? esc(analysis.priority) : 'Entendendo o impacto'}</dd></div><div><dt>Dificuldade estimada</dt><dd>${conversation.answers.problem ? esc(analysis.difficulty) : 'A avaliar'}</dd></div></dl><div class="assistant-preview-empty">${icon('activity')}<p>O assistente transforma seu relato em uma solicitação mais clara para a equipe de TI.</p></div></div>`}
      </aside></div><footer class="assistant-dialog-footer"><span>Você revisa e confirma. A equipe de TI valida a classificação.</span><button class="text-button" data-ai-action="manual">Prefiro preencher o formulário ${icon('arrow')}</button></footer>`;
    const messages = dialog.querySelector('#assistant-messages');
    messages.scrollTop = messages.scrollHeight;
    if (focusInput) dialog.querySelector(reviewing ? '#assistant-review-form input' : '#assistant-message-input')?.focus({ preventScroll: true });
  }
  function reply(text) {
    try {
      const next = replyToAssistant(conversation, text);
      previous.push(conversation); conversation = next; draft = null; render(true);
    } catch (error) { dialog.querySelector('#assistant-error').textContent = error.message; }
  }
  dialog.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button?.dataset.aiReply) { reply(button.dataset.aiReply); return; }
    switch (button?.dataset.aiAction) {
      case 'close': dialog.close(); break;
      case 'restart': conversation = startConversation(); previous = []; draft = null; render(true); break;
      case 'back': if (previous.length) { conversation = previous.pop(); draft = null; render(true); } break;
      case 'manual': {
        const review = dialog.querySelector('#assistant-review-form');
        onManual(review ? { ...analyzeRequest(conversation.answers), ...Object.fromEntries(new FormData(review)) } : conversation.answers.problem ? analyzeRequest(conversation.answers) : {});
        break;
      }
    }
  });
  dialog.addEventListener('submit', event => {
    const form = event.target;
    if (form.id === 'assistant-chat-form') { event.preventDefault(); reply(new FormData(form).get('message')); }
    if (form.id === 'assistant-review-form') {
      event.preventDefault();
      draft = Object.fromEntries(new FormData(form));
      try {
        const analysis = analyzeRequest(conversation.answers);
        onCreate({ ...draft, aiAnalysis: { ...analysis, tipCategory: draft.category, tipSteps: suggestResolution(draft.category, conversation.answers.problem), reviewed: true } });
      } catch (error) { form.querySelector('#assistant-review-error').textContent = error.message; }
    }
  });
  dialog.addEventListener('change', event => {
    if (event.target.name === 'category' && event.target.closest('#assistant-review-form')) {
      const category = event.target.value;
      event.target.form.elements.team.value = category === 'Rede e internet' ? 'Infraestrutura' : ['Software', 'Acessos'].includes(category) ? 'Sistemas e acessos' : 'Suporte técnico';
    }
  });
  dialog.addEventListener('keydown', event => {
    if (event.target.id === 'assistant-message-input' && event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault(); event.target.form.requestSubmit();
    }
  });
  return { open };
}
