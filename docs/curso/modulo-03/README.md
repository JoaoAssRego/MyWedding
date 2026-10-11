---
tipo: modulo
modulo: 3
status: em-andamento
tags:
  - curso/modulo
  - curso/modulo-03
---

# Módulo 3 — Node e HTTP sem framework

**Entregável:** uma API minúscula de contratos, sem framework nenhum, usando o domínio do
módulo 2 (`Money`, `Contrato`).
**Onde vive o código:** `sandbox/modulo-03/`, importando o domínio de `sandbox/modulo-01/`.
**Status:** em andamento.

## Por que sem framework

No módulo 5 o Rails vai fazer quase tudo deste módulo sozinho: abrir a porta, ler a URL,
escolher a função certa, transformar objeto em JSON, devolver o status. Quem nunca fez isso à
mão olha para um controller do Rails e vê mágica. Quem fez vê **o que foi automatizado** — e
sabe o que procurar quando a automação falha.

A ponte é literal: por baixo do Rails existe o **Rack**, em que uma aplicação é uma função que
recebe a requisição e devolve status, cabeçalhos e corpo — o mesmo formato do handler de
`createServer` escrito na 3.1. A primeira aula do módulo 5 parte daqui.

Este módulo é, de propósito, trabalho braçal: cada coisa que um framework faz, você faz uma
vez com as próprias mãos.

## Aulas

| # | Aula | Status |
|---|---|---|
| 3.1 | [O primeiro servidor: processo, porta, requisição e resposta](03-1-primeiro-servidor.md) | concluída |
| 3.2 | [Rotas e serialização: o domínio atravessando a rede](03-2-rotas-e-serializacao.md) | concluída |
| 3.3 | [`async`: o servidor testado por um programa](03-3-async-e-teste-do-servidor.md) | em andamento |

> [!note] O módulo fecha na 3.3
> Com a troca do backend para Rails ([plano, 10/10/2026](../00-plano-de-estudos.md#mudança-de-rota-10102026)),
> a 3.3 é a última aula deste módulo. Estavam previstas, e foram **cortadas daqui**: ler o
> corpo de um `POST`, validação de entrada e erros como respostas HTTP. As três voltam no
> módulo 5, em Rails — onde cada uma será comparada com o que teria sido feito à mão com
> `node:http`.

## Pendências herdadas do módulo 2

- **`Money` pode ser negativo?** Vence no módulo 6, com o `CHECK` da coluna no Postgres.
- `if (parc[0] && parc[5])`, `arrayObjectParcelas`, getters no estilo Java — ver
  [módulo 2](../modulo-02/README.md#pendências-do-módulo).
