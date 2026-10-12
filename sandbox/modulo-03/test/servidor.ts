import { servidor, type StatusHttp } from "../server.ts";
import type { AddressInfo } from "node:net";
import { URL } from "node:url";
import { verificar } from "../../test/verificar.ts";
import { contratos } from "../../contratos/contratos.ts";
import type { Contrato } from "../../contrato/contrato.ts";
import { Money, type MoneyJson } from "../../modulo-01/money/money.ts";

servidor.listen(0);

const endereco = (servidor.address() as AddressInfo).port;
console.log(`Servidor rodando na porta: ${endereco}`);

async function requisicaoGet(
  url: URL,
  descricao: string,
  statusEsperado: StatusHttp,
): Promise<void> {
  try {
    let req = await fetch(url);
    verificar(descricao, req.status === statusEsperado);
  } catch (e) {
    console.log(`A requisição FALHOU! Mensagem de erro: ${e}`);
  }
}

async function requisicaoPost(
  url: URL,
  descricao: string,
  corpo: RequestInit,
  statusEsperado: StatusHttp,
): Promise<Response | undefined> {
  try {
    const resposta = await fetch(url, corpo);
    verificar(descricao, resposta.status === statusEsperado);
    return resposta;
  } catch (e) {
    console.log(`A requisição FALHOU! Mensagem de erro: ${e}`);
    return undefined;
  }
}

let urlSaude = new URL(`http://localhost:${endereco}/saude`);
await requisicaoGet(urlSaude, "Resultado da saúde do servidor", 200);

// teste método Get parâmetros
let urlSaudeOrigem = new URL(
  `http://localhost:${endereco}/saude?origem=monitor`,
);
await requisicaoGet(
  urlSaudeOrigem,
  "Resultado da saúde do servidor com '?'",
  200,
);

// Esperando Erro, pois /saude não aceita método POST
const respostaPostSaude = await requisicaoPost(
  urlSaude,
  "Esperando Erro, pois /saude não aceita método POST",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Falhou" }),
  },
  405,
);

verificar(
  "Resposta 405 de /saude deve informar o cabeçalho Allow: GET",
  respostaPostSaude?.headers.get("allow") === "GET",
);

let urlContratos = new URL(`http://localhost:${endereco}/contratos`);
await requisicaoGet(
  urlContratos,
  "Resultado do endpoint de lista de contratos",
  200,
);

let urlContrato1 = new URL(`http://localhost:${endereco}/contratos/1`);
await requisicaoGet(urlContrato1, "Resultado do endpoint de contrato 1", 200);

let urlContrato01 = new URL(`http://localhost:${endereco}/contratos/01`);
await requisicaoGet(
  urlContrato01,
  "Resultado do endpoint de contratos/01",
  404,
);

let urlNaoExiste = new URL(`http://localhost:${endereco}/nao-existe`);
await requisicaoGet(
  urlNaoExiste,
  "Resultado do endpoint de rota inexistente",
  404,
);

let urlQualquerCoisa = new URL(
  `http://localhost:${endereco}/saude/qualquer-coisa`,
);
await requisicaoGet(
  urlQualquerCoisa,
  "Resultado do endpoint de Qualquer Coisa",
  404,
);

try {
  const respostaHttp = await fetch(`http://localhost:${endereco}/contratos/1`);
  const contratoDaApi = await respostaHttp.json();
  const contratoLocal = contratos[0];

  const valoresParcelas: Money[] = contratoDaApi.parcelas.map(
    (parcela: { numero: number; valor: MoneyJson }) =>
      Money.deJSON(parcela.valor),
  );

  const resultado = valoresParcelas.reduce(
    (acc, valor) => acc.somar(valor),
    Money.deCentavos(0),
  );

  if (contratoLocal === undefined) {
    throw new Error("Contrato não identificado!");
  }
  verificar(
    "Valor total do contrato deve corresponder ao valor exato",
    resultado.toJSON().centavos === contratoLocal.getTotal().toJSON().centavos,
  );
} catch (e) {
  console.log("Não foi possível fazer a requisição");
}

const respostaHttp = await fetch(`http://localhost:${endereco}/contratos`);
const listaContratosApi: Contrato[] = await respostaHttp.json();

verificar("Devem existir 2 contratos", listaContratosApi.length === 2);
// Testes
servidor.close();
