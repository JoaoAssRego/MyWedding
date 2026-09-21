# Como as aulas são registradas

Cada aula vira **um arquivo próprio**. Nada de aula registrada só no chat: o chat some, o
repositório fica.

## Onde

```
docs/curso/
  00-plano-de-estudos.md        mapa do curso e checklist de progresso
  como-registrar-as-aulas.md    este arquivo
  convencoes.md                 regras que valem para o projeto inteiro
  modulo-NN/
    README.md                   índice do módulo, entregável, pendências
    NN-M-nome-da-aula.md        uma aula
```

`NN` é o número do módulo, `M` o número da aula dentro dele. O nome é o assunto da aula, em
kebab-case e em português, como o resto de `docs/curso/`.

## Estrutura de uma aula

Toda aula tem as mesmas seções, e as seções vazias são omitidas:

- **Contexto** — de onde a aula partiu e o que já existia.
- **Teoria** — o conceito, curto, com o *porquê* e não só o *como*.
- **Tarefa** — o que o João escreve. Numerada, para poder ser conferida item a item.
- **Verificação** — o comando que diz se ficou certo, e qual é a saída esperada.
- **O que aconteceu** — o resultado real: o que passou, o que quebrou, o que foi corrigido.
  Preenchida **depois** da tarefa, não antes.
- **Pendências** — o que ficou em aberto e precisa voltar.

## Quando escrever

O arquivo nasce quando a aula é passada, com Contexto, Teoria, Tarefa e Verificação. Ele é
atualizado quando a tarefa é entregue, com "O que aconteceu" e as pendências. Uma aula só é
considerada fechada quando a verificação passou e isso está escrito no arquivo.

Regra que vale mais que as outras: **erro entra no registro.** O erro é material de aula — o
que quebrou, por que quebrou e como foi consertado vale mais, seis meses depois, do que o
código que funcionou de primeira.

## Regras que extrapolam a aula

Quando uma aula produz uma regra que vale para o projeto inteiro — uma ferramenta, uma
convenção, um comando — a regra vai para [`convencoes.md`](convencoes.md) e a aula fica só com
a história de como ela apareceu.
