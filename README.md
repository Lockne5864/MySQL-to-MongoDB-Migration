# MySQL to MongoDB — migração e relatórios de funcionários

Projeto acadêmico recuperado e reorganizado para portfólio. O objetivo é **extrair registros de funcionários de um banco MySQL**, transformar as informações relacionais em documentos MongoDB e gerar relatórios a partir dos dados migrados.

> \*\*Origem:\*\* o projeto original continha scripts `Migrate.js`, `Relatorios.js` e `TestConnection.js`. Esta versão é uma \*\*refatoração posterior\*\*, com correções, organização e uma base de dados demonstrativa. Como a base original não foi recuperada, o funcionamento ponta a ponta ainda deve ser validado no ambiente do autor. Os registros do exemplo são fictícios.

## Tecnologias

* JavaScript / Node.js 22.9+
* MySQL 8 (consultas SQL com `JOIN` e `ROW\_NUMBER()`)
* MongoDB 7 (documentos, índices e agregação)
* `mysql2` e driver oficial `mongodb`
* Docker Compose (opcional, para o ambiente local de demonstração)

## Como funciona

```text
MySQL (employees / salaries / titles / departments)
  → consulta SQL por lotes → transformação em JavaScript
  → upsert no MongoDB (employees\_portfolio.employees)
  → filtros e agregações (relatórios)
```

Cada documento possui `employee\_id`, `name`, `salary`, `title`, `department` e `manager\_id`. A migração usa a versão mais recente dos registros de salário, cargo, departamento e gerente, com base nas datas do conjunto de dados. `employee\_id` possui índice único; uma nova execução **atualiza** o funcionário já migrado, em vez de duplicá-lo.

## Executando um exemplo completo (Windows / PowerShell)

Requisitos: Node.js 22.9+ e Docker Desktop com Docker Compose. Execute os comandos na pasta do projeto:

```powershell
Copy-Item .env.example .env
docker compose up -d
npm install
npm run check
npm run migrate
npm run reports
```

A primeira inicialização do MySQL pode levar alguns instantes. Caso `npm run check` indique erro de conexão, verifique se os contêineres terminaram de iniciar (`docker compose ps`).

No menu `npm run reports`, experimente:

* `a`: ID `1002` ou nome `Bruno Oliveira` (equipe de gerente)
* `b`: cargo `Engineer`
* `c`: departamento `Sales`
* `d`: média salarial por departamento
* `s`: sair

Os exemplos de funcionários foram inventados para este repositório. Não há necessidade de baixar a base de dados acadêmica original.

Para encerrar os contêineres, execute `docker compose down`. Não use `docker compose down -v` se quiser preservar os dados do Docker.

## Utilizando seus próprios bancos

Edite o `.env` com credenciais de um ambiente de teste e com o endereço do MongoDB. Não adicione esse arquivo ao Git. O arquivo `.env.example` contém somente credenciais ilustrativas para uso local. A consulta usa a estrutura de tabelas do conjunto de dados de exemplo `employees` (MySQL 8+). Para outro esquema, adapte `src/migrate.js`.

> Atenção: o exemplo Docker expõe os bancos apenas em `127.0.0.1` e utiliza uma senha pública de demonstração. \*\*Não utilize esta configuração em produção\*\*, nem configure o servidor para acesso remoto com as mesmas credenciais.

## Organização do repositório

```text
src/
  config.js             configurações vindas do ambiente
  migrate.js            consulta SQL, processamento por lotes e upsert
  transform.js          conversão linha SQL → documento MongoDB
  reports.js            menu interativo e consultas agregadas
  check-connection.js   diagnóstico de conexões
docker/mysql/init/       schema e dados fictícios de demonstração
tests/                  testes unitários sem banco de dados
.env.example            exemplo de variáveis de ambiente
compose.yaml            MySQL e MongoDB locais
```

## Testes e limitações

Execute `npm test` para conferir a transformação e validação dos parâmetros. Os testes unitários não exigem banco de dados. O roteiro Docker permite a execução integrada, mas essa execução deve ser confirmada localmente.

* A consulta escolhe o último registro histórico por data; não é um sistema completo de RH.
* A paginação reduz o uso de memória no Node.js, mas consultas grandes podem exigir índices e otimizações adicionais no MySQL.
* A busca de gerente por nome assume nomes distintos; se houver homônimos, use o ID.
* Os relatórios foram concebidos para exploração acadêmica, não para ambiente de produção.

## Melhorias possíveis

* Testes de integração automatizados com bancos de dados temporários.
* Medição e comparação de tempos de consulta com e sem índices.
* Fluxo de logs e métricas de migração.
* Interface web para os relatórios.

