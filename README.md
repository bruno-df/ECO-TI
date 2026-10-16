# ECO-TI - Central de serviços de TI

Projeto acadêmico somente front-end, responsivo, independente do SIGD e sem vínculo ou autorização da SEMA. Nome anterior: GOVSAFE 360. Repositório público indicado pelo usuário: https://github.com/bruno-df/ECO-TI.

**Demonstração publicada:** https://eco-ti-dusky.vercel.app/. Produção Ready, sem login; dez testes Playwright aprovados na URL real. O deploy foi feito por envio do build estático; novos pushes ao GitHub não atualizam automaticamente esta publicação.

## Entrega da Unidade VI

O índice das seis entregas está em [EVIDENCIAS.md](EVIDENCIAS.md). A pasta [entrega/](entrega/) reúne manifesto com URLs/hash/estado remoto, relatório PDF de até cinco páginas, matriz de autonomia com cinco cenários, dois prints ECO-TI, resultados locais, vídeo e trace Playwright.

Publicação e CI remota só são consideradas concluídas quando verificadas. Consulte `entrega/manifesto.json` e [PUBLICACAO.md](entrega/PUBLICACAO.md).

## Executar e testar

Node.js 20 ou superior. O front-end não usa dependências em produção. Para abrir a prévia: `npm run dev`; acesse o endereço impresso, normalmente `http://127.0.0.1:5173`.

```sh
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

O build gera `dist/`. A configuração Vercel usa framework Other, comando `npm run build` e saída `dist`. Não há variável de ambiente ou chave de IA necessária.

São 28 testes das regras e cinco cenários de interface em dois projetos Chromium: desktop 1440 x 1000 e mobile 390 x 844. Emulação mobile não equivale a Safari/iOS ou aparelho físico. Cada teste usa contexto novo e dados fictícios.

O Playwright gera HTML, JSON, vídeo e trace. Use `npm run test:e2e:report` ou `npx playwright show-trace entrega/playwright/assistente-desktop.trace.zip`. `node scripts/collect-evidence.mjs` coleta amostras da última execução aprovada; `node scripts/verify.mjs` registra verificações locais e build.

Para testar uma URL publicada, defina `ECO_BASE_URL` com a URL real antes de `npm run test:e2e`. `node scripts/verify-published.mjs` compara os oito arquivos com `dist/`, executa os dez testes e preserva os resultados locais anteriores. No Windows com certificados corporativos, use `node --use-system-ca scripts/verify-published.mjs`. Use somente ambientes de demonstração sem dados institucionais.

## Funcionalidades e limites

- Novo chamado: formulário manual ou Assistente de TI em linguagem simples.
- Categoria, equipe, prioridade, dificuldade e dica inicial sugeridas; revisão e confirmação antes de criar.
- Busca, filtros, ordenação, paginação, quadro por status, atribuição e encaminhamento.
- Comentários, histórico, visões simuladas de solicitante/equipe e exportação CSV/JSON.

O assistente é uma simulação de IA por regras locais, sem modelo de linguagem ou API. Prioridade considera alcance e impacto; dificuldade técnica é estimada separadamente. Casos desconhecidos ficam em Outros / A avaliar. A equipe pode corrigir a classificação. Enter envia; Shift+Enter quebra linha. O rascunho dura enquanto o assistente está aberto.

Sem autenticação, autorização real, backend, banco compartilhado ou envio a equipes reais. A troca de perfil é visual. Os dados ficam no navegador e origem atuais. A chave histórica `govsafe360.tickets.v1` foi preservada por compatibilidade; telas e exports usam ECO-TI. Anexos guardam somente nome e tamanho. Limpar o armazenamento pode apagar registros.

## CI, publicação e reversão

A workflow `.github/workflows/ci.yml` verifica sintaxe, testes unitários, Playwright desktop/mobile e build em pushes, PRs e acionamento manual. Artefatos permanecem no GitHub por 14 dias. Resultados locais não comprovam CI remota.

Veja [PUBLICACAO.md](entrega/PUBLICACAO.md) para login, envio ao remoto, importação na Vercel e reversão com `git revert` e novo deploy. Não use force push para substituir histórico nem inclua credenciais em arquivos públicos.

## Estrutura

`src/`: interface e regras. `tests/`: testes unitários e E2E. `scripts/`: prévia, build, verificação e coleta. `entrega/`: materiais acadêmicos. `playwright.config.js`: desktop/mobile, vídeo e trace. `vercel.json`: hospedagem estática.
