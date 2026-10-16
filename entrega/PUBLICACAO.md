# ECO-TI - Publicação e reversão

Repositório indicado pelo usuário: https://github.com/bruno-df/ECO-TI.

A visibilidade pública foi confirmada por consulta à API pública do GitHub em 16/10/2026. Nenhum repositório privado foi listado, copiado ou publicado. O estado mais recente da publicação é registrado em `manifesto.json`.

## GitHub

O primeiro teste de envio em modo `--dry-run` encontrou ausência de autenticação local: `could not read Username ... terminal prompts disabled`. Essa verificação não publicou arquivos. O usuário informou que concluiria o login; credenciais não foram solicitadas no chat.

O fluxo oficial do Git Credential Manager foi iniciado e concluído com sucesso. O commit da aplicação `2e6a042aa8cb8bbb31663bddab21d61c4b04d1aa` foi enviado à branch `main` e confirmado pela API pública. A execução [38943481645](https://github.com/bruno-df/ECO-TI/actions/runs/38943481645) terminou com `completed / success`, incluindo os testes de interface. O relatório e o pacote final podem constar em um commit posterior de documentação.

Depois de autenticar o Git, o envio é feito ao remoto público indicado. Se ainda não houver remoto:

```sh
git remote add origin https://github.com/bruno-df/ECO-TI.git
```

Confira o destino antes de enviar:

```sh
git remote -v
git status --short
git push -u origin HEAD:main
git rev-parse HEAD
```

O comando de envio pressupõe que `main` remota está vazia ou é ancestral da versão local. Se houver commits remotos novos, busque e integre o histórico; não use `--force` para substituir trabalho.

## Vercel

**URL pública verificada:** https://eco-ti-dusky.vercel.app/.

Projeto `eco-ti`, equipe `bruno-dfs-projects`, ambiente Production, status **Ready**. Deployment `4vSVdqQUDZwZuakfBTxAjnM6GyZr`; URL individual retornada: https://eco-rbxc93xjg-bruno-dfs-projects.vercel.app. Painel: https://vercel.com/bruno-dfs-projects/eco-ti.

O usuário informou que concluiu o login; a sessão `bruno-df` foi confirmada no navegador. A conexão Git disponível apontava para outra organização. Para publicar o projeto solicitado, foi usado **Vercel Drop**, enviando somente os oito arquivos de `dist/` (163,8 KB), gerados da versão `f587d6d713705d16f202d2ef7027d64010ea0696`. Nenhum outro repositório foi copiado, plano pago contratado ou permissão de GitHub ampliada.

Em 16/10/2026 às 14:18 (America/Cuiaba), a URL pública respondeu sem autenticação. Os oito arquivos foram comparados byte a byte com o build local: todos idênticos, HTTP 200. Os dez testes Playwright passaram na URL real, em desktop e mobile, sem falhas ou instabilidades. Os resultados, prints, vídeo e trace da publicação estão separados das evidências locais anteriores.

**Atualizações não são automáticas pelo GitHub nesta publicação.** Para atualizar, executar `npm run build` e enviar a pasta `dist/` no painel do projeto existente, conferindo o destino e a URL depois. A configuração `vercel.json` permanece disponível para uma futura importação Git autorizada: framework Other, build `npm run build`, saída `dist`. O upload de `dist/` não inclui os cabeçalhos personalizados desse arquivo. Nenhuma variável de ambiente ou chave de IA é necessária.

Para repetir a verificação publicada, definir `ECO_BASE_URL` e executar `node scripts/verify-published.mjs`. No Windows com certificados corporativos, usar `node --use-system-ca scripts/verify-published.mjs`; a validação TLS permanece ativa. O script compara os arquivos e roda a suíte, preservando as evidências locais.

## CI e evidências

A workflow `.github/workflows/ci.yml` roda sintaxe, testes unitários, Playwright desktop/mobile e build; publica os relatórios como artefatos por 14 dias. Resultados locais não comprovam execução no GitHub. A URL da execução e sua conclusão devem constar no manifesto após verificação remota.

```sh
npm ci
npx playwright install chromium
npm run check
npm test
npm run test:e2e
npm run build
```

## Reversão

- Código compartilhado: usar `git revert HASH_DA_ALTERACAO` e enviar o novo commit; não reescrever o histórico público.
- Vercel: republicar uma versão anterior verificada, pelo histórico de deployments ou por um novo commit de reversão. Confirmar a URL depois.
- Dados locais: exportar JSON em Preferências antes de restaurar a demonstração. A restauração remove os dados do navegador atual após confirmação.
- A chave histórica `govsafe360.tickets.v1` foi mantida para compatibilidade com registros locais existentes; os nomes e exports exibidos ao usuário usam ECO-TI.

Fontes técnicas: https://playwright.dev/docs/ci-intro e https://vercel.com/docs/git/vercel-for-github.
