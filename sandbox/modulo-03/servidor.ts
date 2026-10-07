import { createServer, type ServerResponse } from "node:http";
const servidor = createServer((req, res) => {
  if (req.url === "/saude") {
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
    erro: "Endpoint não encontrado. Endpoint suportado: /saude",
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

servidor.listen(3000, () => console.log("ouvindo na 3000"));
