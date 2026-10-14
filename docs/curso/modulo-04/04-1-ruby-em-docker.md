---
tipo: aula
modulo: 4
aula: "4.1"
status: concluida
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

**Status:** concluída em 14/10/2026, na sexta revisão.

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

### Terceira revisão — 13/10/2026: não fecha

Commits `a67e9e4` (`.gitattributes`) e `54315b7` (`compose.yaml`); `sandbox/modulo-04/01-divisao.rb`
ainda fora do Git.

Resolvido desde a segunda revisão:

- **O volume monta o repositório inteiro** (`.:/MyWedding`, `working_dir: /MyWedding`) — o
  container enxerga tudo, e o comando da verificação acha o arquivo.
- **`*Gemfile` e `*Gemfile.lock` sem âncora** — `git check-attr` dá `eol: lf` para
  `apps/api/Gemfile` e `apps/api/Gemfile.lock`.
- **`apps/main.rb` apagado** — só sobrou o script em `sandbox/modulo-04/`.

Verificação:

```text
$ docker compose run --rm ruby ruby -v
ruby 4.0.7 (2026-09-15 revision 229531a6cf) +PRISM [x86_64-linux]

$ docker compose run --rm ruby ruby -w sandbox/modulo-04/01-divisao.rb
64814
22
true

$ git ls-files --eol compose.yaml .gitattributes
i/lf    w/lf    attr/text eol=lf        compose.yaml
i/lf    w/crlf  attr/                   .gitattributes
$ git ls-files --eol -o sandbox/modulo-04
i/      w/crlf  attr/text eol=lf        sandbox/modulo-04/01-divisao.rb

$ git check-attr eol -- apps/api/bin/rails bin/rails
apps/api/bin/rails: eol: unspecified
bin/rails: eol: lf
```

Ambiente e script certos: tag exata e `slim`, versão batendo, saída esperada, sem aviso nem com
`-w`. O que impede de fechar:

1. **`bin/*` continua ancorado.** Padrão do `.gitattributes` **com barra** é relativo à pasta
   do `.gitattributes`; sem barra, vale em qualquer nível. Foi por isso que o `*Gemfile`
   passou a funcionar e o `bin/*` não: `apps/api/bin/rails`, o arquivo que motivou a regra,
   segue `unspecified`.
2. **O script não foi commitado** (tarefa 8) — por isso o `i/` vazio. E o `w/crlf` dele pede a
   explicação que a verificação cobra: o `attr` diz `eol=lf`, o arquivo na pasta está `crlf`.
   *Pergunta:* em que momento o Git aplica o `eol=lf` na pasta de trabalho — e quem escreveu
   esse arquivo com `CRLF`?
3. **Tarefa 5 sem registro.** O experimento era escrever a previsão **antes** de rodar cada
   linha no `irb` e comparar com o JavaScript. Não chegaram nem as previsões nem os resultados.
4. **Perguntas em voz alta:**
   - *1 (imagem × container)* — **parcial.** "Pasta temporária do Docker" não é bem isso:
     `/tmp` é uma pasta comum do sistema de arquivos **do container**, a camada gravável que o
     `--rm` apaga junto com ele; o `sandbox/` é o bind mount, ou seja, a própria pasta do
     Windows vista de dentro. E faltou a primeira metade: o que é imagem e o que é container.
   - *2 (`10 / 3`)* — **não fecha.** A resposta diz que atrapalha porque finanças precisam de
     "cada décimo, mesmo que quebre o número" — mas o projeto inteiro existe para **não**
     quebrar: tudo é centavo inteiro. O seu próprio `01-divisao.rb` usou `/` e deu `64814`
     sem nenhum `Float`. *Perguntas para chegar lá:* o que aconteceria com os `22` centavos se
     o script não tivesse a linha do `%`? Haveria algum erro avisando? E o que sai se o total
     for escrito `1750000.0`?

Para a aula 4.2, não para fechar esta: `valorFornecedor`, `numeroParcelas` — nomes em
*camelCase* são o costume do JavaScript; o Ruby usa *snake_case*. É o primeiro sinal do
[padrão a vigiar](../onde-estou.md#padrão-a-vigiar) do port: TypeScript com sintaxe de Ruby.
Também menor: a prova compara com o literal `1750000` em vez da variável do total, e os
comentários do `.gitattributes` estão em português (a [convenção](../convencoes.md#idiomas)
pede inglês). E a tag `4.0.7-slim` fixa o Ruby mas não a base: hoje ela aponta para o Debian
`trixie`, e muda quando a imagem trocar de base — `4.0.7-slim-trixie` fixaria as duas coisas.

### Quarta revisão — 14/10/2026: não fecha

Commit `1463db2` (`.gitattributes`); `compose.yaml` alterado e `01-divisao.rb` ainda fora do Git.

**Tarefa 5 — previsões × resultado no `irb`:**

| Expressão | Previsão | Ruby | O que ensina |
|---|---|---|---|
| `10 / 3` | `3` | `3` | inteiro ÷ inteiro dá inteiro — em JS, `3.3333333333333335` |
| `10 % 3` | `1` | `1` | |
| `-7 / 2` | `-3` | **`-4`** | Ruby arredonda para **baixo** (*floor*), não em direção ao zero como o `Math.trunc` do JS; o `%` acompanha: `-7 % 2` é `1`, e `-7.divmod(2)` é `[-4, 1]` |
| `0.1 + 0.2` | `0.3` | **`0.30000000000000004`** | o `Float` do Ruby é o mesmo IEEE 754 do JavaScript — o mesmo erro do módulo 1 e da primeira frase do README |
| `2 ** 100` | `10000` | **`1267650600228229401496703205376`** | a previsão foi conta (10⁴ no lugar de 2¹⁰⁰); o que importa é o resultado **exato**: o `Integer` do Ruby não tem limite. Em JS, `2 ** 100` vira `1.2676506002282294e+30`, aproximado; exato só com `BigInt` |
| `1.class` | `Integer` | `Integer` | |
| `nil.class` | `nill` | `NilClass` | até o `nil` é objeto de uma classe |
| `"parcela " + 1` | erro | `TypeError` | Ruby não converte sozinho; em JS sairia `"parcela 1"` |

Registrada. Faltou a coluna do JavaScript que a tarefa pedia; ela está acima.

**Resolvido desde a terceira revisão:** tag `ruby:4.0.7-slim-trixie` — Ruby e base fixados
(ainda não commitado). `ruby -v` → `4.0.7`; o script segue imprimindo `64814`, `22`, `true`.

**O que impede de fechar:**

1. **O `bin*` piorou a regra.** Padrão sem barra casa com o **nome** de um arquivo ou pasta;
   `bin*` casa com a pasta `bin`, mas atributo de pasta não desce para os arquivos dentro dela.
   Agora `bin/rails` da raiz **também** saiu `unspecified`, além do `apps/api/bin/rails`. Use o
   `git check-attr eol -- apps/api/bin/rails bin/rails` como teste de cada tentativa: os dois
   precisam sair `lf`.
2. **Script ainda não commitado**, e a pergunta do `w/crlf` continua sem resposta.
3. **Pergunta 1 — ainda parcial.** A resposta diz que o `--rm` "apaga o Docker". Não apaga o
   Docker, e é exatamente aí que mora a diferença que a pergunta quer:
   *o `--rm` apaga o container ou a imagem? Se apagasse a imagem, o que o próximo
   `docker compose run` teria que fazer antes de rodar?* Responder isso é responder o que é
   cada um.
4. **Pergunta 2 — metade fecha.** Sem o `%`, os `22` centavos somem **em silêncio**, sem erro:
   certo, e é essa a armadilha da divisão inteira. A outra metade não: com `1750000.0` "o
   resultado sairia certo, pois a divisão resultaria em um número float". *Rode o próprio
   `01-divisao.rb` trocando o total por `1750000.0` e leia a terceira linha.* Junto com a
   previsão `0.1 + 0.2 → 0.3`, é o mesmo ponto — e é o ponto em que o `Money` inteiro se apoia.

### Quinta revisão — 14/10/2026: não fecha

Commits de `87122db` a `6de958c`; `01-divisao.rb` alterado de novo na árvore de trabalho.

Resolvido desde a quarta revisão:

- **Regra do `bin`** — `**/bin/* text eol=lf`. `git check-attr eol` dá `lf` para `bin/rails`
  **e** `apps/api/bin/rails`. (A linha `bin/*` que ficou acima dela agora é redundante.)
- **Fim de linha do script** — `git ls-files --eol` dá `i/lf w/lf attr/text eol=lf` para
  `01-divisao.rb` e para o `compose.yaml`.
- **`compose.yaml` com `-trixie` commitado.**
- **Pergunta 1 — fecha.** "Apaga o container. Se apagasse a imagem, o `run` teria que baixar a
  imagem de novo." É a diferença inteira: a imagem é o molde baixado e guardado na máquina; o
  container é o que cada `run` cria a partir dele e o `--rm` descarta.

O que impede de fechar:

1. **O script commitado é o experimento, não a entrega.** O `01-divisao.rb` do último commit
   tem `valorFornecedor = 1750000.0` e só imprime a base; a versão da árvore imprime
   `64814.81481481482`, `22.0`, `1750022.0`. A verificação da aula pede `64814`, `22`, `true` —
   e nenhuma das duas versões entrega isso hoje. Experimento é para o `irb` (ou um arquivo à
   parte); o arquivo da tarefa volta a ser a divisão inteira com a prova.
2. **Pergunta 2 — o dado chegou, a explicação não.** `1750022.0` é a observação certa. Falta
   dizer **por quê**: *de onde vieram exatamente os 22 a mais? Multiplique só a base por 27 —
   quanto dá, e o que o resto passa a representar nesse caso? E `64814.81481481482` centavos é
   um valor que alguém consegue pagar?* Com isso respondido, volte à pergunta original: a
   divisão inteira do Ruby ajuda ou atrapalha quem divide centavos, e onde está a armadilha.
3. **O `w/crlf` da terceira revisão continua sem resposta em palavras.** O arquivo foi
   apagado e recriado até sair `lf` — funcionou, mas a pergunta era o porquê: *em que momento o
   Git aplica o `eol=lf` na pasta de trabalho, e quem tinha escrito o arquivo com `CRLF`?*

Sobre os commits, para a próxima vez (não impede o fechamento):

- seis commits para um arquivo de dez linhas — dois deles sem mudança nenhuma de conteúdo, um
  apagando o arquivo e outro recriando. Para fazer o Git reaplicar o `.gitattributes` num
  arquivo que já existe, o comando é `git add --renormalize <arquivo>`, num commit só;
- o tipo `test:` é para testes. Ajuste de fim de linha é `chore:` (ou `fix:` quando conserta
  algo quebrado), e o assunto vai no imperativo: `create first Ruby script`, não
  `create of first ruby script`.

### Sexta revisão — 14/10/2026: fecha

Commit `01f7c6f`: o `01-divisao.rb` voltou a ser a divisão inteira, e o experimento com `Float`
foi para um `experimento.rb` à parte.

```text
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/01-divisao.rb
64814
22
true

$ git ls-files --eol sandbox/modulo-04/
i/lf    w/lf    attr/text eol=lf        sandbox/modulo-04/01-divisao.rb
i/lf    w/crlf  attr/text eol=lf        sandbox/modulo-04/experimento.rb
```

**Pergunta 2 — fecha.** Resumo da resposta: `1750000 / 27` descarta a fração e dá `64814`;
`1750000.0 / 27` dá `64814.81…`, um valor que ninguém consegue pagar. A armadilha: a divisão
inteira impede valor quebrado, mas cria um **rombo invisível** — os 22 centavos somem sem erro,
e o sistema precisa tratar o resto de propósito (somar nas primeiras parcelas, como no
módulo 1).

Complemento sobre o `1750022.0`: com `Float`, a base **já carrega** a fração do resto
(`0.8148… × 27 = 22`), então `base × 27` sozinho já dá `1750000.0`; somar o resto conta os
mesmos 22 centavos **duas vezes**. O resto só é "o que sobrou" quando a divisão é inteira.

**`w/crlf` — fecha.** Quem escreveu com `CRLF` foi o editor, no padrão do Windows; o Git aplica
o `eol=lf` no `add` (normaliza o que entra no índice) e no `checkout` (o que escreve na
pasta), e não reescreve sozinho um arquivo da pasta só porque o `.gitattributes` mudou.

> [!note] A prova ao vivo está no próprio commit
> O `experimento.rb` acabou de sair `i/lf w/crlf`: o editor salvou com `CRLF`, o `add`
> normalizou para `LF` no índice, e a pasta ficou como o editor deixou. É a resposta acima
> acontecendo. Na resposta escrita só com as próprias palavras ("o Git aplica assim que você
> faz `git add`") faltou a metade do `checkout` — vale conseguir dizer as duas sem consulta.

O que a aula deixou: Ruby 4.0.7 rodando em container com tag fixada até a base, o repositório
inteiro montado, `.gitattributes` garantindo `LF` para tudo que o container vai executar —
inclusive o `bin/rails` que ainda nem existe — e o primeiro `.rb`.

## Pendências

Para a aula 4.2 (nomes e estilo):

- `valorFornecedor`, `numeroParcelas` em *camelCase* — o Ruby usa *snake_case*;
- a prova compara com o literal `1750000` em vez da variável do total.

Higiene, sem pressa:

- comentários do `.gitattributes` em português; a linha `bin/*` ficou redundante com
  `**/bin/*`;
- o editor salva `CRLF` por padrão — configurá-lo para `LF` evita o `w/crlf` em todo arquivo
  novo;
- commits: `test:` só para testes, assunto no imperativo, e `git add --renormalize` em vez de
  apagar e recriar arquivo.
