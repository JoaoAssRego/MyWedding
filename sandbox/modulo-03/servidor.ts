import { createServer, STATUS_CODES, type ServerResponse } from "node:http";
const servidor = createServer((req, res) => {
  if (req.url === "/saude") {
    if (req.method === "GET") {
      return responderJson(res, 200, { status: "ok" });
    }
    return responderJson(res, 405, {
      erro: "Método não permitido. Métodos suportados: GET",
    });
  }
  return responderJson(res, 404, {
    erro: "Endpoint não encontrado. Endpoint suportado: /saude",
  });
});

function responderJson(
  res: ServerResponse,
  statusCode: number,
  corpo: unknown,
  headersExtras?: Record<string, string>,
): ServerResponse {
  if (!STATUS_CODES[statusCode]) {
    throw new Error(`Envie um Status Code válido. Enviado: ${statusCode}`);
  }
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    ...headersExtras,
  });
  res.end(JSON.stringify(corpo));
  return res;
}

servidor.listen(3000, () => console.log("ouvindo na 3000"));
