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

No módulo 5 o NestJS vai fazer quase tudo deste módulo sozinho: abrir a porta, ler a URL,
escolher a função certa, transformar objeto em JSON, devolver o status. Quem nunca fez isso à
mão olha para um controller do NestJS e vê mágica. Quem fez vê **o que foi automatizado** — e
sabe o que procurar quando a automação falha.

Este módulo é, de propósito, trabalho braçal: cada coisa que um framework faz, você faz uma
vez com as próprias mãos.

## Aulas

| # | Aula | Status |
|---|---|---|
| 3.1 | [O primeiro servidor: processo, porta, requisição e resposta](03-1-primeiro-servidor.md) | em andamento |

Previstas, na ordem: rotas e status codes a sério; serializar o domínio (`Money` em JSON — e a
pergunta do `valor()` volta); ler o corpo de um `POST` (e com ele, `async`); validação de
entrada; erros como respostas HTTP.

## Pendências herdadas do módulo 2

- **`Money` pode ser negativo?** Vence no módulo 4, mas pode aparecer antes: uma API de
  pagamentos vai querer subtrair.
- `if (parc[0] && parc[5])`, `arrayObjectParcelas`, getters no estilo Java — ver
  [módulo 2](../modulo-02/README.md#pendências-do-módulo).
