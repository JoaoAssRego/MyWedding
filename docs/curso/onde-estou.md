---
tipo: progresso
atualizado: 2026-10-10
modulo_atual: 3
aula_atual: "3.3"
aliases:
  - Onde estou
tags:
  - curso
---

# Onde estou

Nota viva: diz em que ponto da trilha o João está **agora**. É a primeira coisa que o Claude lê
antes de uma aula, e é reescrita ao final de cada sessão — o histórico fica nas aulas, não aqui.

> [!abstract] Agora
> **Módulo 3 — Node e HTTP sem framework**, na [aula 3.3 — `async` e teste do servidor](modulo-03/03-3-async-e-teste-do-servidor.md),
> que agora é a **última do módulo**. Em 10/10 o backend do projeto trocou de NestJS para
> **Ruby on Rails** (API), por causa de um projeto voluntário em Rails — ver a
> [mudança de rota](00-plano-de-estudos.md#mudança-de-rota-10102026). Fechada a 3.3, entra o
> [módulo 4 — Ruby essencial](modulo-04/README.md).

## Estado

Situação em 10/10/2026, pelo repositório (último commit `5ea1a7d`, árvore limpa), verificado:

- `pnpm typecheck` limpo;
- servidor separado em `modulo-03/server.ts` (cria) e `modulo-03/index.ts` (liga na 3000) —
  item 2 da 3.3;
- `modulo-03/experimento.ts` com o `fetch` do item 1;
- `modulo-03/test/servidor.ts` existe, sobe na porta `0`, faz as requisições e fecha o servidor.

Observado no código e ainda **não revisado com o João** — é a revisão da entrega da 3.3:

- o teste **imprime** as respostas com `console.log` em vez de conferi-las com `verificar`
  (itens 4 e 5) — nenhum caso dá `OK` ou `FALHOU`;
- o teste tem **uma cópia** do handler do servidor em vez de importar o `server.ts` — o
  [padrão a vigiar](#padrão-a-vigiar) apareceu;
- `server.ts` importa `contratos` de `index.ts`, que é quem chama `listen(3000)`: importar o
  servidor ainda liga a porta, que era o que o item 2 queria evitar;
- falta o script `test:servidor` (item 6).

Estrutura do `sandbox/`:

| Onde | O quê |
|---|---|
| `modulo-01/money/`, `contrato/`, `types/` | o domínio em TypeScript |
| `modulo-01/05-contrato.ts` | script que imprime os relatórios |
| `modulo-01/test/` | testes de runtime (`04`) e de compilação (`06`) |
| `modulo-03/server.ts` / `index.ts` | servidor `node:http` (cria / liga na 3000) |
| `modulo-03/test/servidor.ts` | teste do servidor, em andamento |
| `tsconfig.json` / `tsconfig.build.json` | verificar × emitir |

## Próximos passos

1. Revisar a entrega da 3.3 pelos pontos acima e fechar a aula: verificação com `OK`/`FALHOU`,
   o teste visto falhando de propósito, pergunta em voz alta.
2. Fechar o [módulo 3](modulo-03/README.md) — sem as aulas de `POST`, validação e erros, que
   foram para o módulo 5.
3. [Módulo 4 — Ruby essencial](modulo-04/README.md), aula 4.1: Ruby em Docker. Ruby não está
   instalado no Windows; Docker 29.8 está.

## Pendências abertas

Cada uma aponta para onde nasceu.

- [ ] **`Money` pode ser negativo?** `subtrair` lança abaixo de zero. O port para Ruby mantém o
  comportamento; vence no módulo 6, com o `CHECK` da coluna — [aula 2.6](modulo-02/02-6-money-value-object.md)

Para **não repetir no port para Ruby** (módulo 4):

- [ ] Getters no estilo Java em `Contrato` — [aula 2.6](modulo-02/02-6-money-value-object.md)
- [ ] `arrayObjectParcelas` ainda carrega "arrayObject" no nome — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md)
- [ ] `if (parc[0] && parc[5])` pula o teste em silêncio se o array vier curto — [aula 2.4](modulo-02/02-4-higiene-dos-testes.md)

Higiene do sandbox TypeScript — fecha se for barata, ou morre com o sandbox, que vira histórico
quando o backend for para Rails:

- [ ] `noEmit` deveria morar no `tsconfig.json`, não só no script — [módulo 2](modulo-02/README.md#terceira-tentativa--04102026-fecha)
- [ ] `"jsx"` e `"**/*.spec.ts"` sobrando na configuração — [aula 2.7](modulo-02/02-7-build.md)

## O que já domina

O que foi entregue **e** verificado — não o que foi só lido.

- **JavaScript:** variáveis, funções, arrays, objetos, erros, módulos; divisão de parcelas sem
  perder centavo (módulo 1).
- **TypeScript (módulo 2, fechado com revisão oral):** `tsconfig` rigoroso; tipagem estrutural
  e por que o apelido não protege; tipos marcados e construtor inteligente; compilação ×
  runtime; `Money` como value object imutável com `#campo` e fábrica; testes de tipo com
  `@ts-expect-error` e o ritual de conferência; build com dois `tsconfig`, e leitura do
  JavaScript gerado.
- **Node e HTTP (módulo 3, aulas 3.1 e 3.2):** processo e porta, event loop, `node:http`,
  roteamento à mão, status code, `405` com `Allow`, serialização com `toJSON`.
- **Depuração:** achou o bug do `&&` a partir da saída dos testes e corrigiu a causa.
- **Ferramentas:** Git e Conventional Commits, pnpm, scripts `typecheck`, `build` e `clean`.
- **Ruby e Rails:** nada ainda — começa do zero no módulo 4.

## Padrão a vigiar

Três vezes no módulo 2 uma mudança foi feita **copiando** em vez de **mover**, e nas três a
cópia antiga apodreceu. Na 3.3 voltou: o teste carrega uma cópia do servidor.

No port para Ruby o risco muda de forma: é **traduzir linha a linha** o TypeScript em vez de
escrever Ruby. Getter vira `def get_id`, `for` vira `for`, e o resultado é TypeScript com
sintaxe de Ruby. A pergunta de revisão é sempre: *como alguém que escreve Ruby escreveria
isso?*

## Ver também

- [Plano de estudos](00-plano-de-estudos.md) — o mapa completo e o checklist de módulos
- [Como eu ensino](como-ensinar.md) — o método das aulas
- [Aulas](aulas.base) — todas as aulas com status
