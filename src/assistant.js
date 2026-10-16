import { normalize } from './domain.js';

// Demonstração determinística: não chama serviços de IA ou APIs externas.
const categories = [
  { category: 'Impressoras', team: 'Suporte técnico', pattern: /impressor|impressao|imprimir|toner|cartucho/, title: 'Problema com impressão' },
  { category: 'Rede e internet', team: 'Infraestrutura', pattern: /internet|wi[ -]?fi|conexao|\brede\b|conectividade|\bvpn\b/, title: 'Problema de conexão com a rede' },
  { category: 'Acessos', team: 'Sistemas e acessos', pattern: /senha|login|logar|permiss|\bacesso\b|bloquead|autentica|nao consigo entrar|nao consigo acessar|entrar no sistema/, title: 'Dificuldade de acesso ao sistema' },
  { category: 'Hardware', team: 'Suporte técnico', pattern: /computador|notebook|monitor|teclado|mouse|\bpc\b|nao liga|tela|bateria|equipamento/, title: 'Problema no equipamento de trabalho' },
  { category: 'Software', team: 'Sistemas e acessos', pattern: /programa|aplicativo|software|sistema|navegador|instal|atualiz|\bapp\b|email|e-mail/, title: 'Dificuldade com aplicativo ou sistema' }
];
const securityPattern = /phishing|ransomware|virus|malware|invadi|suspeit|golpe/;
const physicalRiskPattern = /fumaca|cheiro de queimado|faisca|choque eletrico|superaquec/;
const stages = ['problem', 'clarify', 'scope', 'impact', 'timing', 'attempts', 'department', 'review'];
const prompts = {
  scope: 'Quem está sendo afetado por esse problema?',
  impact: 'Como isso está afetando o trabalho agora?',
  timing: 'Quando começou? Se aparecer uma mensagem de erro, conte também o que ela diz.',
  attempts: 'Você já tentou alguma coisa para resolver? Pode dizer que ainda não tentou.',
  department: 'Para finalizar, qual é o seu setor? Por exemplo: Administrativo, Financeiro ou Laboratório.'
};
export function classifyProblem(problem) {
  const text = normalize(problem);
  if (securityPattern.test(text)) return { category: 'Software', team: 'Sistemas e acessos', title: 'Possível incidente de segurança', uncertain: false };
  if (physicalRiskPattern.test(text)) return { category: 'Hardware', team: 'Suporte técnico', title: 'Equipamento com possível risco físico', uncertain: false };
  const matches = categories.filter(item => item.pattern.test(text));
  // O equipamento ou a rede podem ser apenas o contexto de um problema de senha.
  const access = matches.find(item => item.category === 'Acessos');
  const hardware = matches.find(item => item.category === 'Hardware');
  const selected = matches.find(item => item.category === 'Impressoras') || (/senha|login|logar|permiss|bloquead|autentica/.test(text) && access) || (/nao liga|tela preta|teclado|mouse|monitor/.test(text) && hardware) || matches.find(item => item.category === 'Rede e internet') || access || matches.find(item => item.category === 'Software') || matches[0];
  return selected ? { category: selected.category, team: selected.team, title: selected.title, uncertain: false } : { category: 'Outros', team: 'Suporte técnico', title: 'Solicitação de suporte de TI', uncertain: true };
}
function scopeOf(value) {
  const text = normalize(value);
  if (/nao sei|nao tenho certeza/.test(text)) return 'unknown';
  if (/organizacao|empresa|todos os setores|varios setores|instituicao/.test(text)) return 'organization';
  if (/equipe|meu setor|todo o setor|colegas|varias pessoas/.test(text)) return 'team';
  if (/so eu|apenas eu|somente eu|meu computador|uma pessoa/.test(text)) return 'one';
  return 'unknown';
}
function impactOf(value) {
  const text = normalize(value);
  if (/nao sei|nao tenho certeza/.test(text)) return 'unknown';
  if (/planejad|posso aguardar|nova instalacao|sem interrupcao|nao impede/.test(text)) return 'planned';
  if (/impede|parado|parou|nao consigo trabalhar|sem conseguir trabalhar|bloqueia/.test(text)) return 'blocked';
  if (/dificulta|parcial|consigo trabalhar|lent|alternativa/.test(text)) return 'reduced';
  return 'unknown';
}
export function suggestResolution(category, problem = '') {
  const text = normalize(problem);
  if (physicalRiskPattern.test(text)) return ['Interrompa o uso do equipamento e acione a equipe de TI responsável pelo local.', 'Não abra o equipamento nem faça testes de energia, reparos ou novas tentativas de ligar.'];
  if (securityPattern.test(text)) return ['Não abra links ou anexos suspeitos e não informe credenciais.', 'Avise a equipe de TI pelos canais conhecidos e registre o horário e a mensagem observada, sem incluir senhas.', 'Não execute ferramentas ou arquivos sugeridos pela mensagem suspeita; aguarde orientação da equipe.'];
  return ({
    'Rede e internet': ['Confira se o Wi-Fi está ativado ou se o cabo de rede está conectado ao seu computador.', 'Veja se outras pessoas do setor enfrentam o mesmo problema e informe isso no chamado.', 'Não altere configurações de rede nem reinicie roteadores ou equipamentos compartilhados sem orientação.'],
    Acessos: ['Confira o endereço do sistema e a mensagem de erro, sem compartilhar sua senha.', 'Se houver a opção oficial “Esqueci minha senha”, você pode usar esse fluxo.', 'Permissões novas e contas bloqueadas devem ser analisadas pela equipe responsável; não use a conta de outra pessoa.'],
    Hardware: ['Confira visualmente os cabos do seu equipamento, sem abrir ou desmontar peças.', 'Anote luzes, sons ou mensagens observadas e informe a identificação do equipamento, se souber.', 'Se houver aquecimento anormal, cheiro de queimado ou faíscas, interrompa o uso e acione a equipe de TI.'],
    Impressoras: ['Confira se a impressora está ligada, com papel e se é a selecionada no computador.', 'Anote a mensagem do painel e a localização do equipamento.', 'Não desmonte a impressora nem exclua documentos de outras pessoas da fila.'],
    Software: ['Anote o nome do aplicativo e a mensagem de erro.', 'Salve seu trabalho antes de fechar e reabrir o aplicativo, se isso for possível.', 'Instalações e atualizações devem seguir a orientação da equipe de TI; não baixe programas de fontes desconhecidas.'],
    Outros: ['Descreva o que estava tentando fazer e o resultado esperado.', 'Se houver mensagem de erro, anote o texto sem incluir dados pessoais ou senhas.', 'Aguarde a triagem da equipe antes de fazer alterações técnicas.']
  })[category] || ['Registre o sintoma e aguarde a orientação da equipe de TI.'];
}
export function analyzeRequest(answers) {
  const classification = classifyProblem(answers.clarify && !/nao sei/.test(normalize(answers.clarify)) ? answers.clarify : answers.problem);
  const scope = scopeOf(answers.scope || '');
  const impact = impactOf(answers.impact || '');
  const text = normalize(answers.problem || '');
  const security = securityPattern.test(text);
  const physicalRisk = physicalRiskPattern.test(text);
  let priority = 'Média';
  let priorityReason = 'O alcance ou o impacto ainda não ficou claro; a equipe deve validar a prioridade na triagem.';
  if (impact === 'planned') { priority = 'Baixa'; priorityReason = 'A solicitação pode ser planejada e não interrompe o trabalho atual.'; }
  else if (impact === 'blocked' && scope === 'organization') { priority = 'Urgente'; priorityReason = 'O relato indica interrupção do trabalho em vários setores da organização.'; }
  else if (impact === 'blocked') { priority = 'Alta'; priorityReason = 'O problema impede o trabalho de uma pessoa ou equipe e precisa de atenção.'; }
  else if (impact === 'reduced' && scope === 'organization') { priority = 'Alta'; priorityReason = 'Vários setores são afetados, mesmo com alguma alternativa para trabalhar.'; }
  else if (impact === 'reduced') { priorityReason = 'O trabalho continua com dificuldade ou com uma alternativa disponível.'; }
  if ((security || physicalRisk) && priority !== 'Urgente') { priority = 'Alta'; priorityReason = 'O relato contém sinais de possível risco e requer avaliação prioritária da equipe de TI.'; }
  let difficulty = 'Média';
  let difficultyReason = 'Pode exigir diagnóstico técnico; a causa ainda não foi confirmada.';
  if (classification.uncertain) { difficulty = 'A avaliar'; difficultyReason = 'Faltam detalhes técnicos para estimar a dificuldade.'; }
  else if (security || physicalRisk || /servidor|banco de dados|infraestrutura/.test(text) || classification.category === 'Rede e internet' && ['team', 'organization'].includes(scope)) { difficulty = 'Alta'; difficultyReason = 'O cenário pode envolver infraestrutura compartilhada ou análise especializada.'; }
  else if (classification.category === 'Acessos' || classification.category === 'Software' && /instal|atualiz/.test(text) || classification.category === 'Impressoras' && /papel|toner|cartucho/.test(text)) { difficulty = 'Baixa'; difficultyReason = 'O relato sugere uma solicitação rotineira, sujeita à confirmação da equipe.'; }
  const categoryReason = classification.uncertain ? 'O relato não permitiu identificar uma categoria específica; o suporte fará a triagem.' : `Os termos do relato apontam para ${classification.category.toLowerCase()}.`;
  const description = [
    answers.problem,
    answers.clarify ? `Detalhe adicional: ${answers.clarify}` : '',
    `Pessoas afetadas: ${answers.scope || 'Não informado'}.`,
    `Impacto no trabalho: ${answers.impact || 'Não informado'}.`,
    `Início e mensagem de erro: ${answers.timing || 'Não informado'}.`,
    `Tentativas realizadas: ${answers.attempts || 'Não informado'}.`
  ].filter(Boolean).join('\n\n');
  return { mode: 'simulated', title: classification.title, description, department: answers.department || '', category: classification.category, team: classification.team, priority, difficulty, priorityReason, difficultyReason, categoryReason, tipSteps: suggestResolution(classification.category, answers.problem), originalProblem: answers.problem || '' };
}
export function startConversation() {
  return { stage: 'problem', answers: {}, messages: [{ role: 'assistant', text: 'Olá! Sou o assistente de TI do ECO-TI. Vou ajudar você a explicar o problema e preparar seu chamado. Não precisa conhecer termos técnicos.\n\nO que você estava tentando fazer e o que aconteceu?' }] };
}
export function replyToAssistant(conversation, value) {
  if (!stages.includes(conversation.stage) || conversation.stage === 'review') throw new Error('Revise o chamado ou volte uma resposta para continuar.');
  const text = String(value || '').trim();
  const max = conversation.stage === 'department' ? 100 : conversation.stage === 'problem' ? 1000 : 500;
  if (text.length < (conversation.stage === 'problem' ? 8 : 2) || text.length > max) throw new Error(conversation.stage === 'problem' ? 'Conte um pouco mais sobre o problema, entre 8 e 1.000 caracteres.' : `Informe uma resposta entre 2 e ${max} caracteres.`);
  const answers = { ...conversation.answers, [conversation.stage]: text };
  const messages = [...conversation.messages, { role: 'user', text }];
  let stage;
  let response;
  if (conversation.stage === 'problem') {
    const classification = classifyProblem(text);
    stage = classification.uncertain ? 'clarify' : 'scope';
    response = classification.uncertain ? 'Vamos descobrir juntos. O problema está mais relacionado a qual destas opções? Se não souber, tudo bem: a equipe fará a triagem.' : `Pelo que você descreveu, parece uma solicitação de ${classification.category.toLowerCase()}. Vou registrar seu relato e entender o impacto.\n\n${prompts.scope}`;
  } else {
    stage = conversation.stage === 'clarify' ? 'scope' : stages[stages.indexOf(conversation.stage) + 1];
    response = stage === 'review' ? 'Preparei o resumo e as sugestões de classificação. Confira os dados ao lado, ajuste o que precisar e crie o chamado quando estiver de acordo. A dica de resolução ficará disponível no atendimento.' : prompts[stage];
  }
  return { stage, answers, messages: [...messages, { role: 'assistant', text: response }] };
}
export function quickReplies(stage) {
  return ({
    problem: ['Estou sem internet no meu computador', 'Não consigo entrar no sistema, minha senha não funciona', 'A impressora não está imprimindo'],
    clarify: ['Computador ou equipamento', 'Internet ou rede', 'Senha ou acesso', 'Programa ou sistema', 'Impressora', 'Não sei dizer'],
    scope: ['Só eu', 'Minha equipe / meu setor', 'Vários setores da organização', 'Não sei dizer'],
    impact: ['Impede o trabalho', 'Dificulta, mas consigo trabalhar', 'Solicitação planejada, posso aguardar', 'Não sei dizer'],
    timing: ['Começou hoje, sem mensagem de erro', 'Já acontece há alguns dias', 'Não sei quando começou'],
    attempts: ['Ainda não tentei nada', 'Já conferi os cabos e a conexão', 'Já fechei e abri o aplicativo'],
    department: ['Administrativo', 'Financeiro', 'Laboratório']
  })[stage] || [];
}
