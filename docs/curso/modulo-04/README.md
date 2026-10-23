---
tipo: modulo
modulo: 4
status: em-andamento
tags:
  - curso/modulo
  - curso/modulo-04
---

# Módulo 4 — Ruby essencial

**Entregável:** `Money` e `Contract` portados para Ruby — soma, divisão em parcelas sem perder
centavo, imutabilidade —, com testes em Minitest, tudo rodando dentro de um container Docker.
**Onde vive o código:** `sandbox/modulo-04/`, com o `compose.yaml` na raiz do repositório.
**Status:** em andamento — [aula 4.3](04-3-colecoes-e-blocos.md) passada em 18/10/2026.

## Por que Ruby antes de Rails

O Rails esconde muito. Dá para gerar um CRUD inteiro sem escrever uma linha de Ruby que se
entenda — e depois travar no primeiro `has_many`, no primeiro bloco `do |x|`, no primeiro
`self.` dentro de uma classe. Este módulo é o equivalente dos módulos 1 e 2 para a linguagem
nova: **a linguagem primeiro, o framework depois**.

A vantagem é que não se parte do zero. O João já sabe o que é objeto, classe, imutabilidade,
value object e teste; o que muda é a sintaxe e algumas ideias que o JavaScript não tem. Por isso
cada aula compara com o equivalente em JS/TS ([como-ensinar.md](../como-ensinar.md#formato-de-uma-aula)).

| Já sabe em JS/TS | Vai ver em Ruby |
|---|---|
| `pnpm`, `package.json`, lockfile | Bundler, `Gemfile`, `Gemfile.lock` |
| `node arquivo.ts` | `ruby arquivo.rb`, `irb` para experimentar |
| `class`, `#campo`, `static` | `class`, `@variavel`, `attr_reader`, `self.` |
| `Object.freeze` | `freeze`, e strings que podem ser mutáveis |
| `array.map(x => …)` | blocos: `array.map { \|x\| … }`, `Enumerable` |
| `null` e `undefined` | só `nil` — e tudo é objeto, inclusive ele |
| interface / tipagem estrutural | *duck typing*, módulos e `include` |
| `verificar` caseiro | Minitest, que vem com o Ruby |

## Ambiente: Ruby em Docker

Não há Ruby instalado no Windows, e não vai haver: Ruby roda num container a partir da imagem
oficial `ruby`, com a versão fixada em tag exata (a mesma lógica do lockfile — a máquina de hoje
e a CI de amanhã rodam a mesma coisa). O João escreve o `compose.yaml` na aula 4.1; no módulo 5
ele ganha o serviço do Postgres e o da API.

> [!warning] Atritos previstos na aula 4.1
> - **Fim de linha.** O Git no Windows pode converter `LF` em `CRLF`. Um script com `CRLF` falha
>   dentro do Linux do container com erro que não parece ter nada a ver com isso.
> - **Arquivos criados pelo container** podem nascer com dono `root` no volume montado.
> - **Container que some.** `docker compose run --rm` apaga o container no fim; o que foi
>   instalado dentro dele sem estar no `Gemfile` some junto. É de propósito.

## Aulas

Cada arquivo nasce quando a aula for passada.

| # | Aula | Status |
|---|---|---|
| 4.1 | [Ruby em Docker: imagem, `compose.yaml` e `irb`](04-1-ruby-em-docker.md) | concluída |
| 4.2 | [Tudo é objeto: `nil`, símbolos, *truthiness* e métodos com `?` e `!`](04-2-tudo-e-objeto.md) | concluída |
| 4.3 | [Coleções, blocos e `Enumerable`: as parcelas como lista](04-3-colecoes-e-blocos.md) | em andamento |
| 4.4 | Classes, módulos, `Comparable` e `freeze` — `Money` como value object em Ruby | prevista |
| 4.5 | Bundler e Minitest — os testes do módulo 1 reescritos | prevista |
| 4.6 | `Contract` e parcelas — o domínio completo em Ruby | prevista |

## Nomes em inglês a partir daqui

O domínio do sandbox TypeScript está em português (`Contrato`, `dividirEmParcelas`). Em Ruby ele
nasce em inglês: `Money`, `Contract`, `Installment`. O motivo é o Rails — o *inflector* que
transforma `Contract` em tabela `contracts` é inglês, e o modelo do [README](../../../README.md)
já está em inglês. A regra está em [convencoes.md](../convencoes.md#idiomas).

## Pendências herdadas

- **`Money` pode ser negativo?** Continua aberta. O port mantém o comportamento atual
  (`subtrair` lança abaixo de zero); a resposta definitiva vem no módulo 6, com o `CHECK` da
  coluna.

Do sandbox TypeScript, para **não repetir no port** (todas nascidas no [módulo 2](../modulo-02/README.md#pendências-do-módulo)):

- getters no estilo Java (`getId()`) — em Ruby, `attr_reader :id`;
- nomes que descrevem o tipo em vez do conteúdo (`arrayObjectParcelas`);
- teste que pula em silêncio quando o dado vem curto (`if (parc[0] && parc[5])`) — no Minitest,
  a asserção falha.
