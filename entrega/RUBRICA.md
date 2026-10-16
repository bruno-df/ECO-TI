# ECO-TI - Conferência pela rubrica

Data: 16/10/2026. Este índice relaciona as evidências aos cinco critérios informados pelo aluno. A pontuação cabe ao professor; a conferência não atribui nota.

| Critério | Pontos previstos | Evidências para avaliação |
| --- | ---: | --- |
| Git e GitHub: histórico/evidência | 2 | [Repositório público](https://github.com/bruno-df/ECO-TI), [histórico de commits](https://github.com/bruno-df/ECO-TI/commits/main/), hashes no [manifesto](manifesto.json) e marcos abaixo. |
| Sistema publicado, ou impedimento bem documentado | 2 | [ECO-TI publicado](https://eco-ti-dusky.vercel.app/), [verificação pública](resultados/publicacao-verificada.json), [status Ready](prints/05-vercel-ready.png) e [registro de publicação e reversão](PUBLICACAO.md). |
| Testes e relatório verificável | 2 | [28 testes unitários](resultados/unitarios.tap), [resumo local](resultados/locais-resumo.json), [10 Playwright locais](resultados/playwright-resumo.json), [10 na URL pública](resultados/playwright-publicado.json), [CI aprovada da aplicação](https://github.com/bruno-df/ECO-TI/actions/runs/38943481645) e [relatório de quatro páginas](RELATORIO-ECO-TI.pdf). |
| Governança: 5 cenários, risco e revisão | 2 | [Matriz com cinco cenários](MATRIZ-AUTONOMIA.md): decisão justificada, risco qualitativo, revisão exigida e reversão; [aprovações efetivas e limites](../GOVERNANCA.md). |
| Rastreabilidade e comunicação do processo | 2 | Marcos abaixo, [índice das seis entregas](../EVIDENCIAS.md), [manifesto com URLs e hashes](manifesto.json), [governança](../GOVERNANCA.md) e [histórico das dificuldades de publicação](PUBLICACAO.md). |

## Marcos verificáveis do processo

| Marco | Registro |
| --- | --- |
| Front-end inicial | Commit `9bd5729a99a139c868faad3446a81ae080214a11`: central de chamados ainda com o nome GOVSAFE 360. |
| Abertura guiada | Commit `9fc58da1b16db105f16ea395b980b21f2e7aa98e`: assistente e triagem demonstrativa solicitados pelo humano. |
| ECO-TI, testes e evidências | Commit `2e6a042aa8cb8bbb31663bddab21d61c4b04d1aa`: renomeação, testes e entregas acadêmicas; CI aprovada vinculada a esse hash. |
| Relatório e pacote inicial | Commit `f587d6d713705d16f202d2ef7027d64010ea0696`: documentação; versão usada para gerar os oito arquivos enviados à Vercel. |
| Publicação e testes públicos | Commit `dff8ef4c7a8d8efe115e0445c195a4068a57a64b`: URL real, evidências de dez testes públicos, vídeo e trace; [CI desse commit aprovada](https://github.com/bruno-df/ECO-TI/actions/runs/38946630537). |
| Adequação à rubrica | Este índice e a explicitação dos riscos e revisões são uma atualização documental posterior. O hash correspondente pode ser consultado no histórico do GitHub, sem inserir no arquivo um hash que dependeria do próprio arquivo. |

O humano definiu escopo, perfis, assistente demonstrativo, novo nome, destino público e entregas, além de concluir os logins. O Codex implementou, testou, publicou e documentou dentro desse escopo. As revisões simuladas pelo Playwright não são apresentadas como aprovações humanas. O enunciado menciona Claude; o agente utilizado foi Codex.

## Limites registrados para a avaliação

A aplicação é somente front-end, com IA simulada por regras, dados fictícios e armazenamento local. A publicação foi feita por Vercel Drop, sem deploy automático pelo GitHub. A verificação pública de 16/10/2026 comparou os oito arquivos com o build e executou os dez testes em Chromium desktop/mobile; não comprova dispositivos físicos nem navegadores diferentes.

Os prints, vídeo e trace podem ser conferidos em [EVIDENCIAS.md](../EVIDENCIAS.md). Os comandos de reprodução e a reversão constam no relatório e em [PUBLICACAO.md](PUBLICACAO.md). Os registros descrevem o resultado observado nas datas indicadas.
