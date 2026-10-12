---
tipo: modulo
modulo: 3
status: concluido
tags:
  - curso/modulo
  - curso/modulo-03
---

# Módulo 3 — Node e HTTP sem framework

**Entregável:** uma API minúscula de contratos, sem framework nenhum, usando o domínio do
módulo 2 (`Money`, `Contrato`).
**Onde vive o código:** `sandbox/modulo-03/`, importando `Money` de `sandbox/modulo-01/`, o
`Contrato` de `sandbox/contrato/` e os dados de exemplo de `sandbox/contratos/`.
**Status:** concluído em 11/10/2026, com a [revisão oral](#revisão-oral-de-fechamento) fechada na primeira tentativa.

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
| 3.3 | [`async`: o servidor testado por um programa](03-3-async-e-teste-do-servidor.md) | concluída |

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

## Pendências do módulo

Abertas na [aula 3.3](03-3-async-e-teste-do-servidor.md#pendências): `Contrato[]` tipando o que
vem do `json()`, `catch` que avisa em vez de reprovar, `exclude` do build por lista de pastas.

## Revisão oral de fechamento

A mesma porta do [módulo 2](../modulo-02/README.md#revisão-oral-de-fechamento): explicar em voz
alta, **sem olhar o código**.

1. Do `listen` ao `res.end`: o que acontece quando chega uma requisição? E por que o processo
   não termina sozinho enquanto o servidor está ligado?
2. Por que o `fetch` não lança erro num `404`, e o que isso mudou no seu teste?
3. Conte a importação circular da revisão 1 do começo: quem importava quem, por que funcionava
   rodando o `index.ts` e quebrava rodando o teste.
4. `toJSON` e `deJSON`: o que atravessa a rede e o que fica do lado do servidor? Por que
   `const c: Contrato = await r.json()` compila — e o que acontece ao chamar `c.getId()`?
5. Por que o teste liga o servidor na porta `0`, e não na 3000?

Respondidas, o módulo 3 fecha no [checklist do plano](../00-plano-de-estudos.md#progresso) e o
[módulo 4](../modulo-04/README.md) começa.

### Primeira tentativa — 11/10/2026: fecha

| # | Resposta do João (resumo) | Avaliação |
|---|---|---|
| 1 | `listen` abre a porta e registra o servidor no event loop; a cada requisição o Node chama o handler com `(req, res)`; `res.end` envia — sem ele o cliente espera até o timeout. O servidor escutando é um *handle* ativo, e o Node só sai quando não sobra nada pendente: por isso o `close()` | **fecha** |
| 2 | `fetch` só rejeita em falha de rede (conexão recusada, DNS, abort); `404` é resposta válida. Por isso o teste compara `status` com o esperado — e é preciso olhar `ok`/`status` antes de confiar no `.json()` | **fecha** — e foi além: o `.json()` de um `404` devolve o corpo de erro, não um contrato |
| 3 | `index` ↔ `server`. Rodando o `index`, o `server` recebe um `index` incompleto, mas só usa `contratos` dentro do handler, que roda depois. Rodando o teste, a ordem inverte: o `index` executa o `listen(3000)` antes de `servidor` existir. Correção: contratos num módulo próprio | **fecha**, com uma ressalva abaixo |
| 4 | Só dados atravessam a rede; `JSON.stringify` chama o `toJSON`; classe, métodos, protótipo, `#campos` e invariantes ficam no servidor; `deJSON` reconstrói. `r.json()` é `Promise<any>`, `any` cabe em qualquer tipo, a anotação é promessa sem checagem; `c.getId()` dá `TypeError: c.getId is not a function` | **fecha** |
| 5 | Porta `0`: o sistema operacional escolhe uma livre; evita `EADDRINUSE` com o servidor de desenvolvimento ou testes em paralelo; `servidor.address().port` diz qual foi | **fecha** |

**Ressalva na 3.** A resposta descreve "o padrão típico" e diz que o erro é "um
`ReferenceError` **ou** um valor `undefined`". No caso dele não houve "ou": foi
`ReferenceError: Cannot access 'servidor' before initialization`, registrado na
[revisão 1 da 3.3](03-3-async-e-teste-do-servidor.md#revisão-1--11102026-não-fecha). A
diferença tem nome: `servidor` é um `const` de módulo ESM, e antes de a linha que o declara
rodar ele está na *zona morta temporal* — ler dá erro, não `undefined`. O `undefined` é o que
aconteceria com `var` ou com `require` (CommonJS). Fica como pergunta de aprofundamento, não
como condição: *por que no seu caso foi `ReferenceError` e não `undefined`?*

Módulo fechado: a API de contratos roda sem framework, é testada por um programa que pega as
duas regressões que aconteceram, e o João explica o caminho de uma requisição de ponta a ponta.
