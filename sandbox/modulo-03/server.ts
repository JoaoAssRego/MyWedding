import { createServer, type ServerResponse } from "node:http";
import { contratos } from "./index.ts";

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
