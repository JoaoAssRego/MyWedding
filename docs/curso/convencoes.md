# Convenções do projeto

Regras que valem para o projeto inteiro, independentemente do módulo. Cada uma aponta para a
aula em que apareceu.

## Gerenciador de pacotes: pnpm, nunca `npx`

Dependência se instala no projeto e se executa pelo gerenciador do projeto:

```bash
pnpm install          # instala o que está no package.json / pnpm-lock.yaml
pnpm <script>         # script declarado no package.json
pnpm exec <binario>   # binário do projeto, quando não há script
```

**`npx` está proibido para ferramenta de projeto.** Quando não encontra o binário em
`node_modules/.bin`, o `npx` baixa do registro público um pacote com aquele nome e o executa.
Existe no npm um pacote chamado `tsc` que não é o compilador TypeScript — é uma isca que
existe para avisar quem caiu nessa. Com um typo no nome, o final pode não ser um aviso:
typosquatting é vetor real de ataque em cadeia de suprimentos. `pnpm exec` só olha para o
projeto e falha se não achar, que é o comportamento desejável.

Origem: [aula 2.3](modulo-02/02-3-tipos-no-modulo-1.md).

## Comando repetido vira script

Comando de build, teste ou verificação não se decora nem se copia do histórico do terminal —
vira script no `package.json`. Dentro de um script, `node_modules/.bin` já está no PATH, então
o binário resolve sozinho sem prefixo nenhum.

Origem: [aula 2.3](modulo-02/02-3-tipos-no-modulo-1.md).

## O que é versionado

`pnpm-lock.yaml` entra no git; `node_modules` não (está no `.gitignore`). O lockfile é o que
garante que a máquina de hoje e a CI de amanhã instalem exatamente as mesmas versões.

## Idiomas

Aulas, documentação de curso e interface do produto em português. Código, nomes de arquivo,
commits e documentação técnica (`docs/adr/`, README) em inglês. Os nomes do domínio no código
do sandbox estão em português (`Contrato`, `Parcela`, `dividirEmParcelas`) — decisão a revisar
no módulo 5, quando o código migrar para `apps/api`.

## Commits

Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`. Assunto no
imperativo, em inglês.
