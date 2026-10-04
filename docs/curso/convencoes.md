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
commits e documentação técnica (`docs/adr/`, README) em inglês. Os nomes do domínio no código
do sandbox estão em português (`Contrato`, `Parcela`, `dividirEmParcelas`) — decisão a revisar
no módulo 5, quando o código migrar para `apps/api`.

## Commits

Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`. Assunto no
imperativo, em inglês.
