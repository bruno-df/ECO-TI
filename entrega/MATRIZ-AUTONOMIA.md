# ECO-TI - Matriz de autonomia

Data: 16/10/2026. Escopo: atividade didática, somente front-end, dados fictícios.

| # | Cenário | Decisão | Justificativa | Controle e reversão |
| --- | --- | --- | --- | --- |
| 1 | Editar telas, marca ECO-TI, responsividade e regras locais do protótipo | Executar autonomamente dentro do pedido | O usuário solicitou essas alterações e elas são locais e versionáveis | Diff, testes e commit; reverter por novo commit com `git revert` |
| 2 | Sugerir categoria, equipe, prioridade, dificuldade e dica pelo assistente | Sugerir; exigir revisão e confirmação do solicitante para criar | Regras locais podem interpretar o relato incorretamente; não substituem avaliação técnica | Campos editáveis, identificação de simulação e histórico; equipe pode corrigir prioridade/dificuldade |
| 3 | Rodar testes e capturar prints, vídeo e trace com exemplos fictícios | Executar autonomamente em contextos isolados | O usuário pediu evidências; os testes não usam contas nem chamados reais | Contextos novos de navegador, suíte reproduzível, logs e arquivos de evidência; nenhum dado institucional |
| 4 | Enviar código ao GitHub público bruno-df/ECO-TI e publicar na Vercel | Executar após autenticação e validação dos arquivos e destino | O usuário indicou o repositório público e solicitou a entrega; essa autorização não se estende a outro repositório ou conta | Verificar visibilidade, remoto, diff, testes e URL; sem force push; `git revert` e novo deploy da versão anterior |
| 5 | Expor credenciais/dados reais, ampliar permissões ou apagar conteúdo fora do protótipo | Interromper; pedir autorização específica quando aplicável | Essas ações excedem o front-end didático e podem ser irreversíveis ou ampliar acesso | Não foram executadas; segredos ficam fora do Git. Na restauração local há confirmação e opção prévia de exportar JSON |

A autorização de escopo não comprova autenticação, publicação ou aprovação de cada valor sugerido pela IA. O estado efetivamente observado está registrado em `manifesto.json` e `PUBLICACAO.md`.

## Risco e revisão dos mesmos cinco cenários

Os níveis abaixo são qualitativos e consideram o escopo fictício deste protótipo. A revisão indicada é um controle exigido para a ação; sua realização efetiva deve ser comprovada pelos registros, sem confundir testes automatizados com aprovação humana.

| Cenário | Risco e motivo | Revisão exigida |
| --- | --- | --- |
| 1. Editar o front-end | Baixo: regressão visual ou funcional; alterações locais e reversíveis por Git. | Agente confere diff, responsividade e testes aplicáveis antes de versionar. Humano avalia a entrega e decide sobre uso além do protótipo. |
| 2. Sugerir classificação e resolução | Moderado: classificação ou dica incorreta pode direcionar mal o atendimento. | Solicitante revisa os campos e confirma a criação; equipe de TI valida a triagem antes de agir. Os testes simulam esse fluxo, sem comprovar avaliação de uma equipe real. |
| 3. Executar testes e capturas | Baixo no ambiente fictício: resultado falso positivo ou evidência incompleta. | Agente confere resultados, dados usados e arquivos gerados; professor/aluno pode reproduzir a suíte e examinar trace. |
| 4. Publicar GitHub/Vercel | Moderado: publicar arquivos indevidos ou no destino errado. | Humano autoriza o destino e conclui a autenticação; agente verifica arquivos, remoto, conta, URL pública e testes. Autorização restrita ao ECO-TI informado. |
| 5. Segredos, novos acessos ou exclusões fora do escopo | Alto: exposição de informação, ampliação de acesso ou perda irreversível. | Interromper antes da ação e obter autorização humana específica quando aplicável. Esses atos não foram executados na entrega. |
