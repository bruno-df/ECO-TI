# GOVSAFE 360 · Central de serviços de TI

Protótipo acadêmico **somente front-end**, para abertura, organização e encaminhamento de chamados. O foco é o atendimento operacional: registrar uma solicitação, fazer triagem, encaminhar para uma equipe, atribuir uma pessoa e manter a conversa e o histórico.

É um projeto independente do SIGD. Não tem vínculo, integração ou autorização institucional da SEMA.

## Executar

Requisito: Node.js 20 ou superior. Não há dependências para instalar.

```sh
npm run dev
```

Abra o endereço impresso pelo servidor, normalmente `http://127.0.0.1:5173`. Para outra porta no PowerShell:

```powershell
$env:PORT = '5186'
npm run dev
```

## Funcionalidades

- Criação com protocolo, descrição, categoria, setor, prioridade e equipe de destino.
- Lista com busca sem distinção de acentos, filtros combinados, ordenação e paginação.
- Quadro de chamados por status.
- Encaminhamento, atribuição, alteração de status e prioridade.
- Comentários e histórico de movimentações.
- Visões de solicitante e equipe de TI, acessíveis pelo perfil no canto superior direito.
- Resumo do atendimento, equipes e base de conhecimento pesquisável.
- Exportação de CSV filtrado e JSON; restauração dos dados fictícios.
- Layout responsivo, menu móvel, formulários com rótulos, foco visível e diálogos nativos.

## Escopo e limites

Os perfis são uma **simulação visual**, sem autenticação ou autorização real. O armazenamento usa `localStorage` na chave `govsafe360.tickets.v1`, no navegador e origem atuais. Não existe servidor de aplicação, banco, API, envio de mensagens ou integração externa. O servidor Node é apenas um utilitário local para servir os arquivos estáticos.

As referências de anexos guardam **somente nome e tamanho**, até três arquivos de 5 MB; o conteúdo dos arquivos não é enviado nem armazenado. Não use dados pessoais ou institucionais reais. Limpar os dados do navegador pode apagar os registros. Dois navegadores/dispositivos não compartilham chamados.

A tipografia usa Google Fonts quando disponível e fontes locais como alternativa. O funcionamento do sistema não depende dessa conexão.

## Validar e gerar entrega

```sh
npm run check
npm test
npm run build
```

O build gera `dist/` com HTML, CSS, JavaScript e favicon, sem código de servidor. Veja [EVIDENCIAS.md](EVIDENCIAS.md) e [GOVERNANCA.md](GOVERNANCA.md).

## GitHub e Vercel

A configuração `vercel.json` está pronta: build `npm run build`, saída `dist`, sem framework. A workflow `.github/workflows/ci.yml` verifica sintaxe, testes e build em pushes para `main` e em PRs, disponibilizando os arquivos de entrega como artefato.

Caso o repositório Git ainda não esteja inicializado:

```sh
git init -b main
git add .
git commit -m "feat: central de chamados GOVSAFE 360"
```

1. Crie um repositório no seu GitHub e conecte o remoto indicado pela própria plataforma.
2. Envie a branch `main` ao remoto.
3. Na Vercel, importe esse repositório. Confirme a saída `dist` e publique.
4. Registre as URLs reais, o commit publicado e os resultados dos testes em `EVIDENCIAS.md`.
5. Faça futuras alterações em uma branch e abra um PR; confira a execução da CI antes do merge.

Nenhuma variável de ambiente ou credencial é necessária ao front-end. **Não inclua tokens no repositório.** A configuração de CI não significa que uma execução no GitHub já ocorreu, nem o arquivo Vercel significa que o site está publicado.

## Estrutura

```text
index.html                  Documento inicial
src/app.js                  Interface e interações
src/domain.js               Dados fictícios e regras testáveis
src/icons.js                Ícones SVG locais
src/styles.css              Layout e responsividade
scripts/serve.mjs           Prévia estática local
scripts/build.mjs           Geração da pasta dist
tests/domain.test.mjs       Testes das regras
.github/workflows/ci.yml    Pipeline para o GitHub
vercel.json                 Configuração de hospedagem
```
