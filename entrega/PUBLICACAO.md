# ECO-TI - Publicação e reversão

Repositório indicado pelo usuário: https://github.com/bruno-df/ECO-TI.

A visibilidade pública foi confirmada por consulta à API pública do GitHub em 16/10/2026. Nenhum repositório privado foi listado, copiado ou publicado. O estado mais recente da publicação é registrado em `manifesto.json`.

## GitHub

O primeiro teste de envio em modo `--dry-run` encontrou ausência de autenticação local: `could not read Username ... terminal prompts disabled`. Essa verificação não publicou arquivos. O usuário informou que concluiria o login; credenciais não foram solicitadas no chat.

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

1. Concluir o login em https://vercel.com/login.
2. Em https://vercel.com/new, importar `bruno-df/ECO-TI` depois do envio do código.
3. Usar nome `eco-ti`, framework **Other**, build `npm run build` e diretório de saída `dist`.
4. Nenhuma variável de ambiente ou chave de IA é necessária.
5. Publicar, abrir a URL retornada e verificar título ECO-TI, criação manual, assistente e recarga. Só então registrar a URL real como funcional.

Não se deve inventar um endereço `vercel.app` nem marcar a entrega como publicada apenas porque existe `vercel.json`.

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
