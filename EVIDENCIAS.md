# ECO-TI - Entrega do aluno

Data: 16/10/2026, America/Cuiaba. Somente front-end; dados fictícios.

| Exigência | Evidência verificável |
| --- | --- |
| 1. URL Vercel ou impedimento | `entrega/manifesto.json` e [Publicação](entrega/PUBLICACAO.md) |
| 2. URL GitHub e hash | [Repositório público](https://github.com/bruno-df/ECO-TI) e campo `git.commitAplicacao` no manifesto; estado de envio explícito |
| 3. Testes locais, CI e Playwright | [Resumo local](entrega/resultados/locais-resumo.json), [log unitário](entrega/resultados/unitarios.tap), [resumo Playwright](entrega/resultados/playwright-resumo.json), JSON detalhado e estado da CI no manifesto |
| 4. Dois prints e vídeo/trace | [Central](entrega/prints/01-central-eco-ti.png), [Assistente](entrega/prints/02-assistente-eco-ti.png), [vídeo](entrega/playwright/assistente-desktop.webm), [trace](entrega/playwright/assistente-desktop.trace.zip) |
| 5. Matriz de autonomia | [Cinco cenários com decisões justificadas](entrega/MATRIZ-AUTONOMIA.md) |
| 6. Relatório até cinco páginas | `entrega/RELATORIO-ECO-TI.pdf`, com contagem verificada, e fonte textual `entrega/RELATORIO-ECO-TI.md` |

## Resultados da versão ECO-TI

- Sintaxe JavaScript aprovada; 28 testes unitários aprovados.
- 10 testes Playwright aprovados, cinco cenários em desktop e mobile.
- Build estático gerado em `dist/`.
- Dois prints, vídeo e trace em contextos novos, sem login e com chamados fictícios.
- Visibilidade pública de bruno-df/ECO-TI confirmada pela API pública do GitHub; nenhum repositório privado divulgado.

A primeira execução E2E apresentou quatro falhas de seleção por rótulo nos testes. Os seletores foram corrigidos para o papel acessível `combobox` e os dez testes passaram na nova execução. Os cenários verificam busca/filtros/quadro, abertura manual, atribuição, comentário, persistência, assistente com revisão e dicas, relato vago, migração ao formulário e visão do solicitante.

A revisão de valores dentro dos testes é uma simulação pelo Playwright, não uma aprovação feita pelo humano. As autorizações efetivas do usuário estão em [GOVERNANCA.md](GOVERNANCA.md).

CI remota e Vercel não são inferidas dos resultados locais. O manifesto registra estado e URLs verificadas. Histórico anterior: [docs/HISTORICO-DO-PROTOTIPO.md](docs/HISTORICO-DO-PROTOTIPO.md).
