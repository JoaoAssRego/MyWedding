---
tipo: referencia
aliases:
  - Convenções
tags:
  - curso
---

# Convenções do projeto

Regras que valem para o projeto inteiro, independentemente do módulo. Cada uma aponta para a
aula em que apareceu.

## Gerenciador de pacotes: pnpm, nunca `npx`

Dependência se instala no projeto e se executa pelo gerenciador do projeto:

```bash
pnpm install          # instala o que está no package.json / pnpm-lock.yaml
pnpm <script>         # script declarado no package.json
pnpm exec <binario>   # binário do projeto, quando não há script
```

**`npx` está proibido para ferramenta de projeto.** Quando não encontra o binário em
`node_modules/.bin`, o `npx` baixa do registro público um pacote com aquele nome e o executa.
Existe no npm um pacote chamado `tsc` que não é o compilador TypeScript — é uma isca que
existe para avisar quem caiu nessa. Com um typo no nome, o final pode não ser um aviso:
typosquatting é vetor real de ataque em cadeia de suprimentos. `pnpm exec` só olha para o
projeto e falha se não achar, que é o comportamento desejável.

Origem: [aula 2.3](modulo-02/02-3-tipos-no-modulo-1.md).

## Ruby: Bundler e `bundle exec`

O mesmo raciocínio do `npx`, na linguagem nova. Gem de projeto se declara no `Gemfile`, a versão
exata fica no `Gemfile.lock` (versionado, como o `pnpm-lock.yaml`), e se executa pelo Bundler:

```bash
bundle install          # instala o que está no Gemfile / Gemfile.lock
bundle exec <binario>   # roda o binário na versão travada no lockfile
```

**Nada de `gem install` para ferramenta de projeto.** A gem instalada solta não entra no
lockfile, roda na versão que estiver na máquina, e o RubyGems tem o mesmo problema de
typosquatting que o npm. `bin/rails` e os outros arquivos de `bin/` de um app Rails já passam
pelo Bundler.

Origem: [troca para Rails, 10/10/2026](00-plano-de-estudos.md#mudança-de-rota-10102026); a regra
é exercitada na aula 4.5.

## Ruby roda no container

Todo comando Ruby ou Rails **deste projeto** roda pelo Docker Compose, a partir do `compose.yaml`
da raiz:

```bash
docker compose run --rm <servico> <comando>
```

O container é descartável de propósito: o que não está no `Gemfile`, no `Dockerfile` ou no
repositório não existe. Arquivo versionado que o container executa usa fim de linha `LF`.

Existe um Ruby instalado no Windows (`C:\Ruby40-x64`), mantido pelo João por motivos fora do
projeto — decisão de 18/10/2026. Ele não substitui o container: `ruby` ou `irb` digitados direto
no terminal do Windows respondem pelo Ruby da máquina, não pelo do projeto. Verificação de aula
vale só quando roda pelo `docker compose`.

Origem: [troca para Rails, 10/10/2026](00-plano-de-estudos.md#mudança-de-rota-10102026); o
ambiente é montado na aula 4.1.

## Ruby: RuboCop

Estilo e formatação de Ruby são do RuboCop — o Prettier não entende Ruby. A gem está no
`Gemfile` da raiz (grupo `development`, `require: false`); as gems instaladas vivem no volume
nomeado `gems` (`/usr/local/bundle`), para sobreviver ao `--rm` do container.

```bash
docker compose run --rm ruby bundle exec rubocop        # o repositório inteiro
docker compose run --rm ruby bundle exec rubocop -a     # só as correções seguras
```

Ler as infrações antes do `-a`, e commitar antes de corrigir. `-A` (correções inseguras) nunca
às cegas. Cop desligado no `.rubocop.yml` leva um comentário com o motivo. No editor, o Ruby
LSP formata ao salvar usando o RuboCop do `Gemfile` (`.vscode/settings.json`); a verificação
que vale é a do container. `Layout/EndOfLine` está em `lf`, porque o padrão (`native`) exige
`CRLF` quando roda no Ruby do Windows.

Quando o Rails nascer em `apps/api`, ele traz o próprio `Gemfile` e a própria configuração.

Origem: pedido do João em 23/10/2026, antecipando parte da aula 4.5.

## Comando repetido vira script

Comando de build, teste ou verificação não se decora nem se copia do histórico do terminal —
vira script no `package.json`. Dentro de um script, `node_modules/.bin` já está no PATH, então
o binário resolve sozinho sem prefixo nenhum.

Origem: [aula 2.3](modulo-02/02-3-tipos-no-modulo-1.md).

## O que é versionado

`pnpm-lock.yaml` entra no git; `node_modules` e `dist` não (estão no `.gitignore`). O lockfile
é o que garante que a máquina de hoje e a CI de amanhã instalem exatamente as mesmas versões;
`dist` é derivado do código-fonte e se reconstrói a qualquer momento.

## Verificar e construir são trabalhos diferentes

- **`tsconfig.json`** enxerga tudo, inclusive os testes, e é o que o `typecheck` e o editor
  usam.
- **`tsconfig.build.json`** faz `extends` do primeiro, exclui a pasta de testes e emite para
  `dist/`. É o que o `build` usa.

`exclude` no `tsconfig.json` principal tiraria os testes do compilador inteiro — e os testes de
tipo deixariam de ser testados.

Testes moram numa pasta própria (`test/`), para o `exclude` do build ser uma linha só. Script
que **usa** o domínio (como `05-contrato.ts`) não é teste e fica fora dela.

O `tsc` **nunca apaga** nada de `dist/`: arquivo que deixou de ser compilado continua lá, velho.
Antes de confiar num `dist/`, `pnpm clean`.

Origem: [aula 2.7](modulo-02/02-7-build.md).

## Testes de tipo: ver o erro antes de confiar nele

`@ts-expect-error` aceita **qualquer** erro na linha seguinte — inclusive um nome não importado.
Toda vez que um arquivo de teste de tipos mudar:

1. comentar todas as diretivas;
2. rodar `pnpm typecheck`;
3. conferir que cada erro é **o erro que a linha quer provar**;
4. descomentar.

Origem: [aula 2.6](modulo-02/02-6-money-value-object.md), depois de quatro testes passando por
*"Cannot find name"*.

## Idiomas

Aulas, documentação de curso e interface do produto em português. Código, nomes de arquivo,
commits e documentação técnica (`docs/adr/`, README) em inglês.

Nomes do domínio: o sandbox TypeScript (módulos 1–3) ficou em português (`Contrato`, `Parcela`,
`dividirEmParcelas`) e fica assim, como histórico. **Do módulo 4 em diante, o domínio é escrito
em inglês** (`Money`, `Contract`, `Installment`, `Payment`): o *inflector* do Rails, que liga
`Contract` à tabela `contracts`, é inglês, e o modelo do README já está em inglês. Mensagens que
o usuário lê (erros da API, telas) continuam em português.

## Commits

Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`. Assunto no
imperativo, em inglês.
