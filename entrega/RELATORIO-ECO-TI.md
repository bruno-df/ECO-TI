# ECO-TI - Relatório da Unidade VI

Gerado em 16/10/2026 13:57 (America/Cuiaba). PDF verificado: 4 páginas.

## 1. Projeto e identificação

Central de chamados de TI somente front-end, responsiva, com dados fictícios. Projeto independente do SIGD, sem autorização ou integração da SEMA. Agente efetivo: Codex; não houve execução do Claude nesta sessão.

Repositório público: https://github.com/bruno-df/ECO-TI

Hash da aplicação e testes: `2e6a042aa8cb8bbb31663bddab21d61c4b04d1aa`. Um commit posterior pode conter somente a documentação final.

Estado GitHub: Enviado ao repositório público. Envio à branch main concluído e hash confirmado pela API pública do GitHub.

Estado Vercel: Impedimento documentado: Login da Vercel ainda não comprovado; página de autenticação aberta para o usuário.

Estado CI: Concluída com sucesso no GitHub Actions. https://github.com/bruno-df/ECO-TI/actions/runs/38943481645

## 2. Execução e resultados

O agente implementou e renomeou o front-end, construiu assistente de IA simulada por regras, organizou testes e CI, executou verificações e gerou evidências. Foram aprovados 28 testes unitários e 10 Playwright (desktop e mobile), além de sintaxe e build. A primeira execução E2E teve quatro falhas de seletores; após o ajuste para combobox, dez testes passaram.

Os testes usam contextos novos e dados fictícios. Cobrem busca, filtros, quadro, criação manual, atribuição, comentário, persistência, assistente, revisão de prioridade, dicas, relato vago, migração ao formulário e visão do solicitante. A revisão dentro dos testes é simulada pelo Playwright, não uma aprovação feita pelo humano.

Dois prints em `entrega/prints/`; vídeo e trace em `entrega/playwright/`; logs e resultados em `entrega/resultados/`. Emulação Chromium não comprova Safari/iOS nem aparelho físico.

## 3. Aprovações e autonomia

O humano aprovou o front-end responsivo, as duas visões, a demonstração assistida, o novo nome ECO-TI e as seis entregas no repositório público informado. Informou que concluiria os logins do Git e Vercel; isso não comprova publicação. O agente não atribuiu a si aprovação humana dos valores usados em testes.

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

## 4. Limites e reversão

Sem backend, autenticação ou autorização real; perfis são visuais. Dados locais não são compartilhados. O assistente é simulado e suas sugestões precisam de validação técnica. Anexos guardam só metadados. Não foram utilizadas credenciais ou informações institucionais nos testes.

Reversão de código público: `git revert HASH_DA_ALTERACAO`, envio ao remoto e novo deploy. Vercel: republicar uma versão anterior verificada. Dados: exportar JSON antes de confirmar a restauração local. A chave de armazenamento histórica foi mantida por compatibilidade.

Reproduzir: `npm ci`, `npx playwright install chromium`, `npm run check`, `npm test`, `npm run test:e2e`, `npm run build`.

Fontes: https://playwright.dev/docs/ci-intro e https://vercel.com/docs/git/vercel-for-github.
