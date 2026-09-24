# MyWedding — instruções para o Claude

Este repositório é um projeto de aprendizado e também um vault do Obsidian. O conhecimento
sobre o curso vive nas notas de `docs/curso/`; elas são a fonte, não a memória da conversa.

## Antes de responder qualquer coisa sobre o projeto

1. Ler `docs/curso/onde-estou.md` — módulo e aula atuais, próximos passos, pendências.
2. Ler `docs/curso/como-ensinar.md` — o método. Resumo: o João escreve todo o código do
   projeto; o Claude ensina, passa tarefa e revisa.
3. Abrir a aula atual em `docs/curso/modulo-NN/` e conferir o estado real do repositório.

## Documentar tudo no vault

Toda aula, decisão, erro e pendência vai para uma nota em `docs/curso/`, seguindo
`docs/curso/como-registrar-as-aulas.md` (frontmatter, links em Markdown relativo, callouts).
Ao final de cada sessão, reescrever `docs/curso/onde-estou.md`.

## Regras rápidas

- pnpm, nunca `npx` — ver `docs/curso/convencoes.md`.
- Conversa e aulas em português; código, commits e documentação técnica em inglês.
