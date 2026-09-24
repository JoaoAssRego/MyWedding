---
tipo: aula
modulo: 2
aula: "2.1"
status: concluida
conceitos:
  - interface
  - import-type
  - verbatimModuleSyntax
tags:
  - curso/aula
  - curso/modulo-02
---

# Aula 2.1 — Migração para `.ts` e tipos próprios

**Status:** concluída.
**Registro reconstruído a partir dos commits** `0456912`..`14d4394` — esta aula aconteceu
antes de as aulas passarem a ser documentadas, então aqui está o que o código conta.

## Contexto

O módulo 1 terminou com `money.js`, `04-testes.js` e `05-contratos.js` em JavaScript puro,
funcionando. O objetivo da aula foi trazer o mesmo código para TypeScript sem mudar o
comportamento.

## Teoria

**Tipo não é decoração, é restrição.** O valor de tipar `dividirEmParcelas` não é o editor
autocompletar; é o compilador recusar a chamada errada antes de o programa rodar.

**Interface descreve a forma de um objeto.** `Contrato` e `Parcela` não são classes nem
validação em runtime — são a descrição de que forma um objeto precisa ter para ser aceito. Em
runtime elas desaparecem por completo.

**`import type`.** Com `verbatimModuleSyntax` ligado, importar um tipo exige `import type`.
Sem isso o compilador não consegue saber se pode apagar a linha na emissão, e uma importação
que existia só para tipos viraria um `require` de verdade no JavaScript final.

**Um tipo por arquivo, em `types/`.** Separar `Contrato` e `Parcela` do `money.ts` é o que
permite, depois, que módulos diferentes usem o mesmo tipo sem importar a lógica junto.

## Tarefa

1. Adicionar TypeScript como dependência de desenvolvimento do `sandbox/`.
2. Criar `tsconfig.json` em modo `strict`.
3. Renomear `money.js` → `money.ts` e tipar os parâmetros.
4. Extrair `Contrato` e `Parcela` para `modulo-01/types/`.

## O que aconteceu

Tudo entregue. O caminho ficou registrado nos commits, inclusive os tropeços — `f6120e4`
("Import Ts files allowed") é o `allowImportingTsExtensions` sendo descoberto depois de o
import por extensão `.ts` ter sido recusado, e `07fee51` é a convenção PascalCase para tipos
sendo aplicada depois.

Estado final: `money.ts` exporta `dividirEmParcelas`, `somar`, `formatarCentavos` e
`gerarParcelas`; `types/contrato.ts` e `types/parcela.ts` com as duas interfaces.

## Pendências

Os arquivos `04-testes.js` e `05-contratos.js` continuaram em JavaScript. Eles importam
`money.ts` e funcionam, mas não são verificados por nada — tratado na
[aula 2.3](02-3-tipos-no-modulo-1.md).
