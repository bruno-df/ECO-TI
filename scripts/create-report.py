"""Gera o relatório acadêmico a partir de evidências locais verificáveis.
Dependências opcionais de documentação: reportlab e pypdf.
"""
from pathlib import Path
from datetime import datetime, timezone, timedelta
from xml.sax.saxutils import escape
import json

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'entrega'
m = json.loads((OUT / 'manifesto.json').read_text(encoding='utf-8-sig'))
local = json.loads((OUT / 'resultados/locais-resumo.json').read_text(encoding='utf-8-sig'))
pw = json.loads((OUT / 'resultados/playwright-resumo.json').read_text(encoding='utf-8-sig'))
stamp = datetime.now(timezone(timedelta(hours=-4))).strftime('%d/%m/%Y %H:%M (America/Cuiaba)')
fonts = Path('C:/Windows/Fonts')
if (fonts / 'arial.ttf').exists():
    pdfmetrics.registerFont(TTFont('Eco', str(fonts / 'arial.ttf')))
    pdfmetrics.registerFont(TTFont('EcoBold', str(fonts / 'arialbd.ttf')))
    pdfmetrics.registerFontFamily('Eco', normal='Eco', bold='EcoBold', italic='Eco', boldItalic='EcoBold')
else:
    pdfmetrics.registerFontFamily('Helvetica', normal='Helvetica', bold='Helvetica-Bold', italic='Helvetica-Oblique', boldItalic='Helvetica-BoldOblique')
FONT = 'Eco' if (fonts / 'arial.ttf').exists() else 'Helvetica'
BOLD = 'EcoBold' if FONT == 'Eco' else 'Helvetica-Bold'
TEAL = colors.HexColor('#087f73')
INK = colors.HexColor('#294438')
MUTED = colors.HexColor('#5a7164')
styles = {
    'body': ParagraphStyle('body', fontName=FONT, fontSize=9.7, leading=14.3, textColor=INK, spaceAfter=9),
    'small': ParagraphStyle('small', fontName=FONT, fontSize=8, leading=11.5, textColor=MUTED, spaceAfter=7),
    'h1': ParagraphStyle('h1', fontName=BOLD, fontSize=25, leading=30, textColor=TEAL, spaceAfter=10),
    'h2': ParagraphStyle('h2', fontName=BOLD, fontSize=17, leading=23, textColor=INK, spaceAfter=13),
    'h3': ParagraphStyle('h3', fontName=BOLD, fontSize=11, leading=16, textColor=TEAL, spaceBefore=11, spaceAfter=8),
    'cell': ParagraphStyle('cell', fontName=FONT, fontSize=8.3, leading=12, textColor=INK),
    'th': ParagraphStyle('th', fontName=BOLD, fontSize=8.3, leading=12, textColor=colors.white),
    'mono': ParagraphStyle('mono', fontName='Courier', fontSize=8.8, leading=12.5, textColor=INK, spaceAfter=8)
}

def p(text, style='body'):
    return Paragraph(text, styles[style])

def table(headers, rows, widths):
    data = [[p(escape(x), 'th') for x in headers]] + [[p(escape(str(x)), 'cell') for x in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f0f6f2'), colors.white]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 9), ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('LINEBELOW', (0, 0), (-1, 0), .5, TEAL),
        ('LINEBELOW', (0, 1), (-1, -1), .3, colors.HexColor('#dce8df'))
    ]))
    return t

repo = m['git']['repositoryUrl']
commit = m['git']['commitAplicacao']
git_state = 'Enviado ao repositório público' if m['git']['published'] else 'Commit local; envio ainda não comprovado'
ci_state = m['ci']['status']
vercel_state = m['vercel']['url'] if m['vercel']['status'] == 'verified' else 'Impedimento documentado: ' + m['vercel']['reason']
published = m.get('publishedTests', {})
published_summary = f"URL pública sem login: {published.get('playwrightPassed', 0)} Playwright aprovados; {published.get('filesMatchBuild', 0)} arquivos idênticos ao build. Deploy por Vercel Drop, sem atualização automática por Git."
rows = [
    ['1', 'Vercel', vercel_state],
    ['2', 'GitHub e hash', git_state + '. URL e hash completo abaixo.'],
    ['3', 'Testes', f"{local['unit']['tests']} unitários + {pw['passed']} Playwright aprovados; sintaxe e build aprovados. CI: {ci_state}."],
    ['4', 'Evidências visuais', 'Dois PNGs ECO-TI; vídeo WebM e trace ZIP da conversa assistida.'],
    ['5', 'Autonomia', 'Matriz com cinco cenários, decisão justificada, controle e reversão.'],
    ['6', 'Relatório', 'Documento com execução, autorizações, limites e reversão; páginas contadas após a geração.']
]
story = [
    p('ECO-TI', 'h1'), p('Entrega do aluno / Unidade VI', 'h2'),
    p('Protótipo acadêmico de central de chamados de TI. A entrega inclui abertura manual e assistida, organização de filas, encaminhamentos, classificação sugerida, comentários e histórico. A aplicação é somente front-end, responsiva e usa dados fictícios.'),
    p('1. Identificação e estado das entregas', 'h3'), table(['#', 'Entrega', 'Estado observado'], rows, [32, 108, 365]),
    Spacer(1, 15),
    p(f'<b>Repositório público:</b> <link href="{escape(repo)}" color="#087f73">{escape(repo)}</link>'),
    p('<b>Hash da versão da aplicação e dos testes:</b>'), p(commit, 'mono'),
    p('O hash identifica a implementação verificada. A documentação final pode estar em um commit posterior; isso evita inserir no relatório um hash que dependeria do próprio arquivo.', 'small'),
    p('<b>Ferramenta efetiva:</b> Codex. O enunciado usa o nome Claude; não houve execução do Claude nesta sessão. O registro de autoria e execução utiliza a ferramenta realmente empregada.'),
    p('Projeto independente do SIGD e sem vínculo, integração ou autorização institucional da SEMA. A escolha da aplicação é didática.', 'small'),
    PageBreak(),
    p('2. Execução e testes', 'h2'),
    p('O agente implementou o front-end e o assistente por regras locais, renomeou a aplicação para ECO-TI, preparou o versionamento e a CI, executou verificações e produziu as evidências. O assistente não utiliza um modelo de linguagem, chave ou serviço externo de IA.'),
    table(['Verificação', 'Resultado verificável'], [
        ['Sintaxe e build', f"JavaScript aprovado; arquivos estáticos em dist/. Node {local['node']}, {local['platform']}."],
        ['Regras locais', f"{local['unit']['tests']} testes aprovados, sem falhas; log TAP preservado."],
        ['Interface', f"Playwright {pw['version']} / Chromium: {pw['passed']} aprovados, {pw['failed']} falhas, {pw['flaky']} instáveis. Desktop 1440 x 1000 e mobile 390 x 844."],
        ['CI no GitHub', ci_state + ('. ' + m['ci']['url'] if m['ci'].get('url') else '. A configuração da workflow não comprova uma execução remota.')],
        ['URL publicada', published_summary]
    ], [110, 395]), Spacer(1, 13),
    p('Os cenários verificam busca, filtros e quadro; criação manual, atribuição e persistência; conversa assistida, revisão de prioridade e dicas; relato vago e migração ao formulário; visão do solicitante e menu móvel.'),
    p('A primeira execução E2E teve quatro falhas nos seletores dos testes. Após usar o papel acessível combobox, os dez testes passaram. Os testes simulam a revisão do solicitante; não representam cliques de aprovação feitos pelo humano.', 'small'),
    p('Duas capturas com chamados fictícios', 'h3')
]
figures = []
for filename, caption in [('01-central-eco-ti.png', 'Print 1 - Central e chamados fictícios.'), ('02-assistente-eco-ti.png', 'Print 2 - Assistente e revisão da sugestão.')]:
    image = Image(str(OUT / 'prints' / filename))
    image.drawHeight = image.imageHeight * 235 / image.imageWidth
    image.drawWidth = 235
    figures.append([image, Spacer(1, 6), p(caption, 'small')])
fig_table = Table([figures], colWidths=[252.5, 252.5])
fig_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 9)]))
story += [fig_table, p('Os PNGs originais estão em entrega/prints/. Vídeo e trace estão em entrega/playwright/. Logs, JSONs e resumos ficam em entrega/resultados/. A emulação móvel foi feita em Chromium; não comprova testes em Safari/iOS ou aparelho físico.', 'small'), PageBreak(), p('3. Autonomia e aprovação humana', 'h2')]
autonomy = [
    ['1', 'Editar o front-end e a marca', 'Executar no escopo', 'Baixo: regressão visual/funcional. Pedido explícito, alterações reversíveis.', 'Agente revisa diff e testes; git revert.'],
    ['2', 'Classificar e sugerir resolução', 'Sugerir e pedir revisão na interface', 'Moderado: classificação ou dica incorreta. A simulação pode errar.', 'Solicitante confirma; equipe valida; campos editáveis e histórico.'],
    ['3', 'Testes e capturas fictícias', 'Executar autonomamente', 'Baixo: falso positivo ou evidência incompleta. Contextos sem contas reais.', 'Agente confere logs e arquivos; aluno/professor pode reproduzir.'],
    ['4', 'Publicar no GitHub/Vercel', 'Executar após autenticação e validação', 'Moderado: arquivos ou destino indevidos. Autorização restrita ao ECO-TI.', 'Humano autoriza destino/login; agente verifica remoto/URL; revert/deploy anterior.'],
    ['5', 'Segredos, dados reais ou ações destrutivas fora do escopo', 'Interromper e obter autorização específica', 'Alto: exposição, ampliação de acesso ou perda irreversível. Fora do escopo.', 'Revisão humana antes da ação. Não executado; exportar antes de restaurar.']
]
story += [table(['#', 'Cenário', 'Decisão', 'Risco/justificativa', 'Revisão/reversão'], autonomy, [23, 103, 103, 155, 121]), Spacer(1, 15), p('O que o humano efetivamente aprovou', 'h3')]
for text in [
    'Construção do sistema de chamados somente front-end e responsivo, independente do SIGD.',
    'Visões de solicitante e equipe de TI, com troca de visão.',
    'Demonstração de assistente, classificação sugerida e dica de resolução, sem exigir integração completa com IA.',
    'Novo nome ECO-TI, repositório público bruno-df/ECO-TI e as seis entregas da atividade.',
    'Logins concluídos pelo usuário; envio ao GitHub, CI e produção Vercel verificados pelo agente. Publicação limitada ao projeto ECO-TI na conta bruno-df.'
]: story.append(p('- ' + escape(text)))
story += [p('Aprovação de escopo não equivale a aprovação humana de cada valor gerado nos testes. Os commits do agente usam identidade técnica fictícia do projeto, sem simular autoria humana.', 'small'), PageBreak(), p('4. Limites, publicação e reversão', 'h2'), p('Limites da aplicação', 'h3')]
for text in [
    'Não há backend, autenticação ou autorização real. A troca de perfil é apenas uma visão da interface.',
    'Os dados ficam no navegador e origem atuais; não são compartilhados entre pessoas ou dispositivos. Limpar o armazenamento pode apagá-los.',
    'A IA é simulada por regras locais. Dificuldade e prioridade são estimativas; dicas não são diagnóstico nem executam alterações em equipamentos.',
    'Anexos guardam somente nome e tamanho. Não são enviados a uma equipe ou serviço externo.'
]: story.append(p('- ' + escape(text)))
story += [p('Estado de publicação observado', 'h3'), p('<b>GitHub:</b> ' + escape(git_state) + '. ' + escape(m['git'].get('reason', ''))), p('<b>Vercel:</b> ' + escape(vercel_state) + '. ' + escape(published_summary)), p('<b>CI:</b> ' + escape(ci_state) + ('. ' + escape(m['ci']['url']) if m['ci'].get('url') else '')), p('Como reverter', 'h3')]
for text in [
    'Código público: criar um novo commit com git revert HASH_DA_ALTERACAO e enviar ao remoto; não substituir o histórico com force push.',
    'Vercel: republicar uma versão anterior verificada ou publicar o commit de reversão; confirmar a URL depois.',
    'Dados locais: exportar JSON em Preferências antes de restaurar. A restauração remove registros do navegador após confirmação. A chave histórica foi preservada para compatibilidade.'
]: story.append(p('- ' + escape(text)))
story += [p('Reproduzir a validação', 'h3'), p('npm ci<br/>npx playwright install chromium<br/>npm run check<br/>npm test<br/>npm run test:e2e<br/>npm run build', 'mono'), p('Fontes e arquivos de referência', 'h3'), p('Manifesto, matriz, registros e instruções detalhadas acompanham esta entrega. Fontes técnicas oficiais: <link href="https://playwright.dev/docs/ci-intro" color="#087f73">playwright.dev/docs/ci-intro</link> e <link href="https://vercel.com/docs/git/vercel-for-github" color="#087f73">vercel.com/docs/git/vercel-for-github</link>.', 'small')]

def page_decoration(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(MUTED); canvas.setFont(FONT, 7.5)
    canvas.drawString(45, A4[1] - 25, 'ECO-TI / UNIDADE VI / ATIVIDADE ACADÊMICA')
    canvas.drawString(45, 23, stamp)
    canvas.drawRightString(A4[0] - 45, 23, f'Página {doc.page}')
    canvas.restoreState()

pdf = OUT / 'RELATORIO-ECO-TI.pdf'
doc = SimpleDocTemplate(str(pdf), pagesize=A4, rightMargin=45, leftMargin=45, topMargin=47, bottomMargin=42, title='ECO-TI - Relatório da Unidade VI', author='ECO-TI - projeto acadêmico', subject='Entrega, execução por agente, autonomia e reversão')
doc.build(story, onFirstPage=page_decoration, onLaterPages=page_decoration)
reader = PdfReader(str(pdf))
if len(reader.pages) > 5:
    raise RuntimeError(f'Relatório excedeu o limite: {len(reader.pages)} páginas.')
text = '\n'.join(page.extract_text() or '' for page in reader.pages)
for required in ['ECO-TI', commit, 'Autonomia', 'reverter', 'Codex']:
    if required.lower() not in text.lower(): raise RuntimeError(f'Texto ausente no PDF: {required}')
m['report'] = { 'path': 'entrega/RELATORIO-ECO-TI.pdf', 'pages': len(reader.pages), 'generatedAt': stamp }
(OUT / 'manifesto.json').write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
md = f'''# ECO-TI - Relatório da Unidade VI

Gerado em {stamp}. PDF verificado: {len(reader.pages)} páginas.

## 1. Projeto e identificação

Central de chamados de TI somente front-end, responsiva, com dados fictícios. Projeto independente do SIGD, sem autorização ou integração da SEMA. Agente efetivo: Codex; não houve execução do Claude nesta sessão.

Repositório público: {repo}

Hash da aplicação e testes: `{commit}`. Um commit posterior pode conter somente a documentação final.

Estado GitHub: {git_state}. {m['git'].get('reason', '')}

Estado Vercel: {vercel_state}

{published_summary} Fonte do build enviado: `{m['vercel'].get('sourceCommit', commit)}`. Hashes e comparação byte a byte em `entrega/resultados/publicacao-verificada.json`.

Estado CI: {ci_state}. {m['ci'].get('url') or 'Nenhuma execução remota comprovada nesta captura.'}

## 2. Execução e resultados

O agente implementou e renomeou o front-end, construiu assistente de IA simulada por regras, organizou testes e CI, executou verificações e gerou evidências. Foram aprovados {local['unit']['tests']} testes unitários e {pw['passed']} Playwright (desktop e mobile), além de sintaxe e build. A primeira execução E2E teve quatro falhas de seletores; após o ajuste para combobox, dez testes passaram.

Os testes usam contextos novos e dados fictícios. Cobrem busca, filtros, quadro, criação manual, atribuição, comentário, persistência, assistente, revisão de prioridade, dicas, relato vago, migração ao formulário e visão do solicitante. A revisão dentro dos testes é simulada pelo Playwright, não uma aprovação feita pelo humano.

Dois prints em `entrega/prints/`; vídeo e trace em `entrega/playwright/`; logs e resultados em `entrega/resultados/`. Emulação Chromium não comprova Safari/iOS nem aparelho físico.

## 3. Aprovações e autonomia

O humano aprovou o front-end responsivo, as duas visões, a demonstração assistida, o novo nome ECO-TI e as seis entregas no repositório público informado. Concluiu os logins do Git e Vercel. O agente verificou o envio público e a CI, confirmou a conta bruno-df, publicou o build e testou a URL real. O agente não atribuiu a si aprovação humana dos valores usados em testes.

''' + (OUT / 'MATRIZ-AUTONOMIA.md').read_text(encoding='utf-8') + '''
## 4. Limites e reversão

Sem backend, autenticação ou autorização real; perfis são visuais. Dados locais não são compartilhados. O assistente é simulado e suas sugestões precisam de validação técnica. Anexos guardam só metadados. Não foram utilizadas credenciais ou informações institucionais nos testes.

Reversão de código público: `git revert HASH_DA_ALTERACAO`, envio ao remoto e novo deploy. Vercel: republicar uma versão anterior verificada. Dados: exportar JSON antes de confirmar a restauração local. A chave de armazenamento histórica foi mantida por compatibilidade.

Reproduzir: `npm ci`, `npx playwright install chromium`, `npm run check`, `npm test`, `npm run test:e2e`, `npm run build`.

Fontes: https://playwright.dev/docs/ci-intro e https://vercel.com/docs/git/vercel-for-github.
'''
(OUT / 'RELATORIO-ECO-TI.md').write_text(md, encoding='utf-8', newline='\n')
print(f'Relatório gerado e validado estruturalmente: {len(reader.pages)} páginas. Revisão visual ainda necessária.')
