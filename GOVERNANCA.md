# Registro de escopo e autonomia

Data: 16/10/2026.

## Decisão didática

O usuário solicitou a construção rápida de um sistema de chamados de TI somente em front-end, responsivo e independente do SIGD, para uma atividade de curso. Na definição de requisitos, escolheu as visões **Solicitante e equipe de TI, com troca de visão**.

O nome adotado foi GOVSAFE 360, conforme a proposta da Unidade VI. Não representa uma aplicação oficial da SEMA ou autorização para operar sistemas institucionais.

## Operações dentro do escopo

- Criação e edição dos arquivos do protótipo na pasta do projeto.
- Geração de dados fictícios e armazenamento apenas no navegador.
- Verificações locais de sintaxe, regras de negócio e build.
- Preparação de configuração para publicação na Vercel e CI no GitHub.
- Inicialização do Git local em `main`, com identidade técnica fictícia de projeto na versão inicial.
- Documentação de limites, evidências e roteiro de apresentação.

## Limites explícitos

- Não há backend, credenciais, autenticação ou permissões reais.
- Não há integração com SIGD, SEMA, diretórios de pessoas, e-mail ou sistemas públicos.
- A troca de perfil não é uma barreira de segurança.
- Atribuir ou encaminhar um chamado altera somente dados da demonstração.
- O assistente de TI é uma simulação por regras, sem IA externa. Não envia relatos a provedores de IA nem usa credenciais.
- Sugestões de categoria, prioridade, dificuldade e equipe são editáveis antes da criação; o usuário precisa confirmar a abertura.
- A dica de resolução é uma orientação inicial demonstrativa, sujeita à avaliação técnica. Não executa alterações no equipamento.
- A sugestão original e o evento de revisão pelo solicitante são preservados no chamado; isso não representa validação técnica da equipe.
- Anexos são referências locais; os arquivos não são enviados.
- Publicação, criação de repositório, execução da CI e PR só devem ser apresentados como realizados quando existirem URLs e resultados verificáveis.

## Fluxo sugerido para evolução

`Git local → GitHub → Vercel → testes de aceitação → branch/PR → CI → revisão`

Antes de um uso real, seriam necessários autenticação, controle de acesso validado no servidor, armazenamento compartilhado, validação e auditoria no backend, política de retenção e aprovação institucional. Esses itens ficam fora da atividade de front-end.
