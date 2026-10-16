# Evidências · Unidade VI

Data de preparação: 16/10/2026, America/Cuiaba.

## Identificação da entrega

| Item | Situação |
| --- | --- |
| Aplicação | GOVSAFE 360 · Central de serviços de TI |
| Tipo | Front-end estático com dados fictícios |
| Perfis | Solicitante e equipe de TI, simulados |
| Código local | Repositório Git nesta pasta, branch `main` |
| GitHub | Publicação pendente; registrar URL real após o envio |
| Vercel | Configuração pronta; registrar URL real após o deploy |
| Branch/PR | Fluxo documentado; PR remoto ainda não criado |
| CI | Workflow preparada; execução remota ainda não comprovada |

## Verificações automatizadas

Execute `npm run check`, `npm test` e `npm run build`. Os testes cobrem:

1. Integridade e unicidade dos dados fictícios.
2. Geração de protocolo e evento inicial de criação.
3. Validação de assunto, descrição, setor e opções.
4. Encaminhamento e registro de status, prioridade e atribuição.
5. Compatibilidade entre responsável e equipe.
6. Ausência de eventos artificiais ao salvar sem alterações.
7. Comentários e limites de mensagem.
8. Busca por acentos, protocolo e solicitante.
9. Combinação de filtros sem mutação dos dados originais.
10. Escopo de solicitações do usuário.
11. Ordenação por prioridade.
12. Indicadores e estado vazio.
13. Serialização dos registros, comentários e histórico.
14. Identificação de dados locais corrompidos.

## Roteiro de aceitação e apresentação

| Cenário | Passos | Resultado esperado |
| --- | --- | --- |
| Criar | Novo chamado → preencher campos → Criar chamado | Protocolo novo, status Aberto e equipe de destino |
| Validar | Tentar criar sem assunto ou com descrição curta | Formulário impede o envio |
| Buscar | Buscar por `conexao`, número ou nome | Lista filtrada sem depender de acentuação |
| Organizar | Abrir filtros → combinar categoria/status/equipe | Apenas registros compatíveis |
| Encaminhar | Abrir chamado → mudar equipe → selecionar integrante → salvar | Responsável pertence à equipe e histórico registra alterações |
| Conversar | Abrir chamado → escrever mensagem → Enviar | Comentário com autor e data |
| Finalizar | Mudar status para Resolvido | Indicadores, lista e quadro atualizados |
| Persistir | Criar/alterar chamado e recarregar | Dados permanecem no mesmo navegador e origem |
| Trocar visão | Perfil → Solicitante | Apenas solicitações de Bruno Fonteles; organização oculta |
| Quadro | Selecionar visualização em quadro | Colunas com cartões por status |
| Exportar | Ícone de exportação na lista | CSV somente dos resultados filtrados |
| Base | Buscar `acesso` na base de conhecimento | Orientação correspondente pode ser aberta |
| Mobile | Testar 390 px e abrir menu/formulários | Interface reorganizada sem corte horizontal da página |
| Teclado | Tab, Enter, Escape e `/` | Controles acessíveis, diálogo fechável, busca focada |
| Restauração | Preferências → restaurar → confirmar | Os 12 registros fictícios voltam |

## Registro de resultados

Os resultados efetivamente executados serão registrados abaixo. O roteiro acima define o que verificar; não declara que todos os testes manuais já passaram.

Verificado localmente em 16/10/2026:

- `npm run check`: aprovado, sem erros de sintaxe.
- `npm test`: **14 testes aprovados, zero falhas**.
- `npm run build`: aprovado, entrega estática gerada em `dist/`.
- HTTP da prévia local: **200** em `http://127.0.0.1:5186`.
- Navegador desktop: criação do chamado fictício `TI-1049`, seleção de categoria com encaminhamento inicial automático, mudança de equipe para Suporte técnico, atribuição a Ana Costa, prioridade Alta e status Em atendimento.
- Histórico: eventos de criação, status, prioridade, encaminhamento e atribuição exibidos corretamente.
- Conversa: comentário adicionado e exibido com autor e data.
- Persistência: após recarregar, o chamado, as alterações e o comentário permaneceram.
- Busca por `conexao`: dois registros encontrados sem precisar informar o acento.
- Solicitante: cinco chamados próprios na sessão de teste; chamado aberto sem os controles de organização da equipe.
- Responsividade: interface real carregada em um iframe de **390 × 844 px**; cartões reorganizados em duas colunas, tabela convertida em cartões e menu móvel aberto com sucesso.
- Quadro: quatro colunas por status, cartões e contagens conferidos na interface.

O repositório Git local usa uma identidade técnica fictícia para a versão inicial (`GOVSAFE 360 <projeto@exemplo.invalid>`), pois não havia identidade de autor configurada no ambiente. Essa identidade não representa uma pessoa nem um e-mail de contato.

Capturas da sessão de teste:

- [Central de chamados](evidencias/central.png).
- [Atendimento e atribuição](evidencias/atendimento.png).
- [Layout de celular](evidencias/mobile.png).

Limites da verificação: o teste responsivo usa largura CSS real, sem simular hardware ou Safari/iOS. A CI não foi executada no GitHub e não existe URL pública verificada nesta entrega. O conector GitHub não estava disponível para publicar, e não havia uma sessão local da Vercel configurada.
