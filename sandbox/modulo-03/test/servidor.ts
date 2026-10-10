import { createServer, type ServerResponse } from "node:http";
import { Contrato } from "../../modulo-01/contrato/contrato.ts";
import { Money } from "../../modulo-01/money/money.ts";
import { quantidadeParcelas } from "../../modulo-01/types/quantidadeParcelas.ts";
import type { AddressInfo } from "node:net";

export const servidor = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const partes = url.pathname.split("/");

  if (partes[1] === "contratos") {
    const id = partes[2];
    const contrato = contratos.find((c) => c.getId() === id);
    if (req.method === "GET") {
      if (partes[3]) {
        return responderJson(res, 404, { erro: "Contrato não encontrado" });
      }
      if (partes[2]) {
        if (!contrato) {
          return responderJson(res, 404, { erro: "Contrato não encontrado" });
        }
        return responderJson(res, 200, {
          ...contrato.toJSON(),
          parcelas: contrato.gerarParcelas(),
        });
      }
      return responderJson(res, 200, contratos);
    }
    return responderJson(
      res,
      405,
      {
        erro: "Método não permitido. Métodos suportados: GET",
      },
      { allow: "GET" },
    );
  } else if (partes[1] === "saude") {
    if (partes[2]) {
      return responderJson(res, 404, { erro: "Contrato não encontrado" });
    }
    if (req.method === "GET") {
      return responderJson(res, 200, { status: "ok" });
    }
    return responderJson(
      res,
      405,
      {
        erro: "Método não permitido. Métodos suportados: GET",
      },
      { allow: "GET" },
    );
  }
  return responderJson(res, 404, {
    erro: "Endpoint não encontrado. Endpoint suportado: /saude e /contratos",
  });
});

type StatusHttp =
  | 200
  | 201
  | 204
  | 400
  | 401
  | 403
  | 404
  | 405
  | 409
  | 422
  | 500
  | 503;

function responderJson(
  res: ServerResponse,
  statusCode: StatusHttp,
  corpo: unknown,
  headersExtras?: Record<string, string>,
): ServerResponse {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    ...headersExtras,
  });
  res.end(JSON.stringify(corpo));
  return res;
}

const contratoSalao = new Contrato(
  "1",
  "Casarão do Paraiso",
  Money.deCentavos(1750000),
  quantidadeParcelas(27),
);

const contratoFotografo = new Contrato(
  "2",
  "Gauss",
  Money.deCentavos(390000),
  quantidadeParcelas(20),
);

export const contratos = [contratoSalao, contratoFotografo];

servidor.listen(0);

const endereco = (servidor.address() as AddressInfo).port;
console.log(`Servidor rodando na porta: ${endereco}`);

// teste método Get sem parâmetros
let reqStatusGet = await fetch(`http://localhost:${endereco}/saude`);
let resultado = await reqStatusGet.json();

console.log(`Resultado da saude do servidor: ${resultado} `);

// teste método Get parâmetros
reqStatusGet = await fetch(`http://localhost:${endereco}/saude?origem=monitor`);
console.log(`Resultado da saude do servidor com '?' : ${resultado}`);

// Esperando Erro, pois /saude não aceita metódo POST
const reqStatusPost = await fetch(`http://localhost:${endereco}/saude`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Allow: "GET",
  },
  body: JSON.stringify({
    status: "Falhou",
  }),
});
console.log(reqStatusPost);

reqStatusGet = await fetch(`http://localhost:${endereco}/contratos`);
console.log(`Resultado da saude do servidor com '?' : ${resultado}`);

let reqGetContrato = await fetch(`http://localhost:${endereco}/contratos`);
let corpo = await reqGetContrato.json();

console.log("Resultado do endpoint de lista de contratos:", corpo);

reqGetContrato = await fetch(`http://localhost:${endereco}/contratos/1`);
corpo = await reqGetContrato.json();

console.log("Resultado do endpoint de contrato 1:", corpo);

reqGetContrato = await fetch(`http://localhost:${endereco}/contratos/01`);
corpo = await reqGetContrato.json();

console.log("Resultado do endpoint de lista de contratos:", corpo);

const reqNaoExiste = await fetch(`http://localhost:${endereco}/nao-existe`);
const corpoNaoExiste = await reqNaoExiste.json();

console.log("Resultado do endpoint de lista de contratos:", corpoNaoExiste);

const reqQualquerCoisa = await fetch(
  `http://localhost:${endereco}/qualquer-coisa`,
);
const corpoQualquerCoisa = await reqQualquerCoisa.json();

console.log("Resultado do endpoint de Qualquer Coisa:", corpoQualquerCoisa);
// Testes
servidor.close();
