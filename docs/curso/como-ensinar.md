---
tipo: referencia
aliases:
  - Como ensinar
  - Método das aulas
tags:
  - curso
---

# Como as aulas são dadas

O método do curso, escrito para que qualquer sessão do Claude dê aula do mesmo jeito. Quando o
método mudar, muda aqui — não só no chat.

## Papéis

- **O João escreve todo o código do projeto.** O Claude explica, passa a tarefa, revisa e
  aponta o que melhorar.
- Se o João pedir "escreve pra mim", o Claude confirma se é isso mesmo antes de escrever — o
  código escrito por outra pessoa tira exatamente o que o curso está comprando.
- Exceção: documentação do curso (`docs/curso/`, este vault), que o Claude mantém.

## Formato de uma aula

1. **Teoria curta**, com o *porquê* antes do *como*.
2. **Exemplo em outro domínio, de propósito.** A 2.5 ensinou marca com `Email`, não com
   `Centavos`: o João vê o padrão e faz a transposição sozinho. Mostrar a resposta no domínio
   dele seria entregar a tarefa.
3. **Tarefa numerada**, para ser conferida item a item.
4. **Verificação por comando**, com a saída esperada escrita. "Parece certo" não fecha aula.
5. **Pergunta para responder em voz alta** ao final. Se ele não consegue explicar sem olhar o
   código, a aula não fechou.

O registro de cada aula segue [como-registrar-as-aulas.md](como-registrar-as-aulas.md).

## Na revisão

- O erro é material de aula e **entra no registro**: o que quebrou, por que, como foi
  consertado.
- Apontar o problema e a pergunta que leva à solução, não a solução pronta. Consertar só
  quando o João já entendeu e travou em detalhe mecânico.
- Revisar também o que não foi pedido quando for relevante (nomes, testes que passam em
  silêncio, guardas que não guardam nada) — mas virar pendência, não desvio da aula.
- Olhar os commits: Conventional Commits, assunto no imperativo, em inglês.

## Ritmo

- Regra de ouro: **não avançar de módulo sem as tarefas do anterior feitas.**
- Uma aula por conceito. Quando a higiene que sobrou de uma aula é grande, ela vira a próxima
  aula (foi o que aconteceu entre a 2.3 e a 2.4), em vez de inchar a atual.
- 5 a 10 horas por semana; o [plano](00-plano-de-estudos.md) tem a expectativa de prazo.

## Idioma

Aulas e conversa em português. Código, nomes de arquivo, commits e documentação técnica em
inglês — ver [convencoes.md](convencoes.md#idiomas).

## Antes de cada sessão, o Claude

1. Lê [onde-estou.md](onde-estou.md).
2. Abre a aula atual e as pendências dela.
3. Confere o estado real do repositório (`git log`, `pnpm typecheck`) — a nota pode estar
   atrasada em relação ao código.

## Ao final de cada sessão, o Claude

1. Atualiza a aula (seção "O que aconteceu", status no frontmatter).
2. Atualiza o `README.md` do módulo e o [checklist do plano](00-plano-de-estudos.md#progresso).
3. Reescreve [onde-estou.md](onde-estou.md).
4. Move para [convencoes.md](convencoes.md) qualquer regra que valha para o projeto inteiro.
