---
tipo: aula
modulo: 4
aula: "4.1"
status: em-andamento
conceitos:
  - docker-imagem-e-container
  - tag-de-imagem
  - docker-compose
  - bind-mount
  - irb
  - fim-de-linha
tags:
  - curso/aula
  - curso/modulo-04
---

# Aula 4.1 — Ruby em Docker: imagem, `compose.yaml` e `irb`

**Status:** em andamento — tarefa passada.

## Contexto

Primeira aula de Ruby. Antes da linguagem, o lugar onde ela roda: não há Ruby instalado no
Windows, e a decisão da [troca para Rails](../00-plano-de-estudos.md#mudança-de-rota-10102026) foi
não instalar — Ruby roda num container, a partir da imagem oficial. É a mesma ideia do
`pnpm-lock.yaml`, levada um passo adiante: em vez de travar só as versões das dependências,
trava a versão da **linguagem** e do sistema operacional em volta dela.

Estado da máquina conferido em 12/10/2026:

- Docker 29.8 e Docker Compose 5.5 instalados — mas o **Docker Desktop estava desligado**
  (`failed to connect to the docker API`). Ele precisa estar rodando antes de qualquer comando.
- O Git está com `core.autocrlf=true` e o repositório não tem `.gitattributes`. Os avisos
  *"LF will be replaced by CRLF"* que aparecem em todo commit vêm daí. Até agora era só ruído;
  com um container Linux lendo os arquivos, deixa de ser.
- Na imagem oficial, o Ruby estável mais recente é o **4.0.7**; a linha **3.4** também é
  mantida (3.4.11).

## Teoria

### Imagem e container

Você já conhece o par: **classe e instância**. A imagem é a classe — um molde imutável, com um
sistema de arquivos pronto (Linux + Ruby + o que mais vier). O container é a instância — o que
existe quando você roda a imagem: um processo, com uma cópia gravável por cima do molde. Dá
para criar quantos containers quiser da mesma imagem, e apagar um não afeta a imagem nem os
outros.

Consequência prática: **o que é escrito dentro do container morre com ele**, a não ser que
esteja numa pasta montada de fora.

### A tag é a versão — e precisa ser exata

O nome de uma imagem tem a forma `nome:tag`. Exemplo em outro domínio, a imagem do Python:

```text
python:3.13.1-slim-bookworm
│      │      │    └── a base: Debian 12 ("bookworm")
│      │      └─────── a variante: "slim", só o essencial
│      └────────────── a versão exata da linguagem
└───────────────────── a imagem oficial
```

`python:3.13` e `python:latest` também existem — e **mudam de conteúdo** quando sai uma versão
nova. É o equivalente a ter `"typescript": "*"` no `package.json`: funciona hoje, e um dia a CI
instala outra coisa sem ninguém ter mudado uma linha. Tag com versão exata é o lockfile da
imagem.

Variantes, de modo geral: a **padrão** é grande (traz compilador e bibliotecas de sobra); a
**slim** é a padrão enxugada; a **alpine** é minúscula, mas usa outra biblioteca C (`musl`), e
gems com código nativo — o driver do Postgres, por exemplo — costumam dar trabalho nela.

### `compose.yaml`: o comando longo vira arquivo

Rodar um container à mão exige dizer a imagem, que pasta montar, onde trabalhar. O Docker
Compose guarda isso num arquivo — a mesma regra de [comando repetido vira
script](../convencoes.md#comando-repetido-vira-script). Exemplo, de novo com Python:

```yaml
services:
  python:
    image: python:3.13.1-slim-bookworm
    working_dir: /work
    volumes:
      - .:/work
```

- `services` — cada serviço é um container que o projeto sabe criar. No módulo 5 este arquivo
  ganha o Postgres e a API.
- `volumes: - .:/work` — um **bind mount**: a pasta atual do Windows aparece dentro do
  container em `/work`. Não é cópia: editar de um lado muda o outro na hora. É por aqui que o
  seu código entra no container — e por aqui que o que o container escreve sobrevive a ele.
- `working_dir` — de onde os comandos partem lá dentro.

E para usar:

```bash
docker compose run --rm python python -c "print(2 ** 10)"
```

`run` cria um container do serviço `python` e executa o comando; `--rm` apaga o container no
fim. O primeiro `python` é o nome do serviço; o resto é o comando. A comparação mais próxima é
o `pnpm exec`: roda uma ferramenta **no ambiente do projeto**, não no da máquina.

### `irb`: o `node` sem argumento do Ruby

`irb` (*interactive Ruby*) é o REPL: você digita uma expressão, ele avalia e mostra o
resultado. Serve para experimentar antes de escrever o arquivo. `exit` sai.

### Fim de linha

Windows termina linha com dois caracteres (`CRLF`, `\r\n`); Linux, com um (`LF`, `\n`). Com
`core.autocrlf=true`, o Git guarda `LF` no repositório mas entrega `CRLF` na sua pasta. O
container lê a sua pasta — e recebe `CRLF`.

Para um `.rb` comum, o Ruby tolera. O estrago aparece em arquivo executável com a primeira
linha `#!/usr/bin/env ruby` — os `bin/rails` e `bin/setup` do módulo 5 são assim. Com `CRLF`,
o Linux procura um programa chamado `ruby\r`, e o erro é este:

```text
/usr/bin/env: 'ruby\r': No such file or directory
```

O `.gitattributes`, na raiz do repositório, diz ao Git como tratar cada tipo de arquivo e vale
para qualquer máquina que clonar o projeto — ao contrário do `core.autocrlf`, que é
configuração de **uma** máquina. As duas palavras que interessam: `text` (é texto, normalize o
fim de linha) e `eol=lf` (na pasta de trabalho, entregue `LF`).

## Tarefa

1. **Ligar o Docker Desktop** e confirmar com `docker info` que o comando responde.
2. **Escolher a tag** da imagem oficial `ruby` no Docker Hub: versão exata, variante `slim`.
   Duas escolhas defensáveis — a 4.0 mais recente, ou a mesma versão do projeto voluntário
   (procure o arquivo `.ruby-version` ou a linha `ruby` do `Gemfile` dele). Anote qual e por
   quê; e por que não `latest` nem `alpine`.
3. **`compose.yaml`** na raiz do repositório, com um serviço `ruby` que use essa tag, monte o
   repositório inteiro e trabalhe a partir da raiz dele.
4. **`.gitattributes`** na raiz, garantindo `LF` pelo menos para o que o container vai ler:
   `.rb`, `.yaml`/`.yml`, scripts de shell e — pensando no módulo 5 — `Gemfile`, `Gemfile.lock`
   e `bin/*`. Decida se vale para o repositório todo ou só para esses; anote a decisão.
5. **Experimento com o `irb`.** Antes de rodar cada linha, **escreva o que você acha** que sai
   — pensando no que o JavaScript daria. Depois rode e compare:

   ```ruby
   10 / 3
   10 % 3
   -7 / 2
   0.1 + 0.2
   2 ** 100
   1.class
   nil.class
   "parcela " + 1
   ```

6. **Container descartável:** rode `touch /tmp/marca` e depois `ls /tmp` num container; rode
   `ls /tmp` de novo num **segundo** `docker compose run`. Depois faça o mesmo criando um
   arquivo dentro de `sandbox/modulo-04/` em vez de `/tmp`. Compare.
7. **Primeiro arquivo Ruby:** `sandbox/modulo-04/01-divisao.rb`. Para um total de `1750000`
   centavos em `27` parcelas, imprime o valor base de cada parcela, o resto que sobra, e uma
   linha provando que base × parcelas + resto devolve o total — com o que você descobriu no
   passo 5, sem `Float` em lugar nenhum. É o primeiro exercício do módulo 1, na linguagem nova.
8. Commits separados: ambiente (`compose.yaml`, `.gitattributes`) e o primeiro script.

## Verificação

```bash
docker compose run --rm ruby ruby -v
```

A versão impressa é a da tag escolhida.

```bash
docker compose run --rm ruby ruby sandbox/modulo-04/01-divisao.rb
```

A saída mostra `64814` como base, `22` como resto, e `true` na prova.

```bash
git ls-files --eol compose.yaml .gitattributes sandbox/modulo-04/01-divisao.rb
```

Para cada arquivo: `i/lf` (o que está guardado no repositório) e `attr/text eol=lf` (a regra
do `.gitattributes` valendo). Se a coluna `w/` mostrar `crlf`, explique o porquê antes de
mudar qualquer coisa — é parte da aula.

Perguntas para responder em voz alta:

1. **Imagem e container: o que é cada um, e por que a `marca` em `/tmp` sumiu mas o arquivo em
   `sandbox/modulo-04/` não?**
2. **`10 / 3` dá `3` em Ruby e `3.3333333333333335` em JavaScript. Para quem divide centavos em
   parcelas, isso ajuda ou atrapalha — e onde está a armadilha?**

## O que aconteceu

### Desvio: o template do `docker init` (12/10/2026)

Durante a tarefa apareceram na raiz um `Dockerfile`, um `.dockerignore`, um `README.Docker.md`
e um `compose.yaml` gerados pelo `docker init` (template genérico de "hello world"), e a
pergunta: *como colocar um serviço Ruby no Dockerfile?*

Resposta dada: nesta aula **não há Dockerfile**. O serviço `ruby` usa a imagem oficial pronta
com `image:`; `build:` + `Dockerfile` servem para montar uma imagem **própria** em cima de
outra, e isso só faz sentido no módulo 5, quando o app Rails precisar do `bundle install` e de
bibliotecas de sistema dentro da imagem. Pontos do template que contradizem a aula:

- `FROM alpine:latest` — as duas escolhas que a tarefa 2 pede para justificar **não** fazer;
- `.dockerignore` com `**/bin` — no módulo 5 esconderia o `bin/rails` do build;
- serviço `app` com `build`/`target: final` rodando um `hello.sh` — sem relação com o projeto.

Encaminhamento: o João decide se apaga os quatro arquivos e escreve o `compose.yaml` à mão
(tarefa 3), ou guarda o `Dockerfile` para o módulo 5.

> [!question] Pergunta extra
> Qual a diferença entre `image:` e `build:` no `compose.yaml`, e o que precisaria acontecer
> para o serviço `ruby` deixar de usar `image:`?

### Erro: `No such file or directory -- main.rb` (12/10/2026)

Primeira versão do `compose.yaml` escrita à mão: `image: ruby:4.0`, `working_dir: /apps`,
`volumes: - .:/apps` e `command: ruby main.rb`, com o script em `apps/main.rb` no Windows.
`docker compose run --rm ruby` falhou com `ruby: No such file or directory -- main.rb (LoadError)`.

Causa: o bind mount monta a **raiz do repositório** em `/apps`. A pasta `apps/` do Windows
vira `/apps/apps/` dentro do container, e o Ruby, partindo de `/apps`, procura
`/apps/main.rb`, que não existe. O nome `/apps` do lado do container coincidiu com o nome da
pasta do lado do Windows, e pareceu que eram a mesma coisa. O lado esquerdo do `:` é caminho
no host; o direito é caminho **dentro** do container — os dois são independentes.

Diagnóstico sugerido: `docker compose run --rm ruby ls` e `docker compose run --rm ruby pwd`,
para ver o que o container enxerga em vez de deduzir.

Outros pontos da revisão do arquivo, ligados à tarefa:

- `ruby:4.0` não é tag exata nem `slim` (tarefa 2);
- `command:` fixo amarra o serviço a um script; a verificação da aula passa o comando no
  `run` (`docker compose run --rm ruby ruby -v`);
- o script da tarefa 7 mora em `sandbox/modulo-04/`, não numa pasta `apps/` nova.

Resposta do João: tag trocada para `ruby:4.0.7-slim` ("a `4.0` atualiza sozinha, e não é o
que precisamos"); `command:` apagado ("não quero amarrar a um serviço único"); script vai para
`sandbox/modulo-04/`. `ruby --version` → `ruby 4.0.7 (2026-09-15 revision 229531a6cf) +PRISM
[x86_64-linux]`.

Segunda revisão:

- O conserto do caminho foi montar `./sandbox/modulo-04:/modulo-04` em vez da raiz. Funciona,
  mas é o mesmo amarramento do `command:`, agora no volume: o container só enxerga o módulo 4,
  o comando da verificação (`ruby sandbox/modulo-04/01-divisao.rb`) não acha o arquivo, e no
  módulo 5 o `apps/api/` fica de fora. A tarefa 3 pede o repositório inteiro.
- `.gitattributes`: `/Gemfile`, `/Gemfile.lock` e `bin/*` estão ancorados na raiz, mas o Rails
  vai morar em `apps/api/`. Conferido com `git check-attr eol`: `apps/api/Gemfile` e
  `apps/api/bin/rails` saem `unspecified`.
- `main.rb` existe em dois lugares (`apps/` e `sandbox/modulo-04/`) — cópia em vez de mover,
  o [padrão a vigiar](../onde-estou.md#padrão-a-vigiar).
- Comentários do `.gitattributes` em português; a convenção pede inglês.
