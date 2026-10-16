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
