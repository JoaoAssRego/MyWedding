import { servidor } from "../server.ts";
import type { AddressInfo } from "node:net";

servidor.listen(0);

const endereco = (servidor.address() as AddressInfo).port;
console.log(`Servidor rodando na porta: ${endereco}`);

try {
  // teste método Get sem parâmetros
  let reqStatusGet = await fetch(`http://localhost:${endereco}/saude`);
  let resultado = await reqStatusGet.json();
  console.log(`Resultado da saude do servidor: ${resultado} `);
} catch (e) {
  console.log(`Resultado da saude do servidor: FALHOU! Mensagem de erro: ${e}`);
}

try {
  // teste método Get parâmetros
  let reqStatusGet = await fetch(
    `http://localhost:${endereco}/saude?origem=monitor`,
  );
  let resultado = await reqStatusGet.json();
  console.log(`Resultado da saude do servidor com '?' : ${resultado}`);
} catch (e) {
  console.log(`Resultado da saude do servidor: FALHOU! Mensagem de erro: ${e}`);
}

try {
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
  console.log(
    `Resultado da Saude do Servidor: OK! Resultado inesperado: ${reqStatusPost}`,
  );
} catch (e) {
  console.log(`Resultado da saude do servidor: FALHOU! Mensagem de erro: ${e}`);
}

try {
  const reqGetContrato = await fetch(`http://localhost:${endereco}/contratos`);
  const corpo = await reqGetContrato.json();
  console.log("Resultado do endpoint de lista de contratos:", corpo);
} catch (e) {
  console.log(
    `Resultado do endpoint de lista de contratos: FALHOU! Mensagem de erro: ${e}`,
  );
}

try {
  const reqGetContrato = await fetch(
    `http://localhost:${endereco}/contratos/1`,
  );
  const corpo = await reqGetContrato.json();
  console.log("Resultado do endpoint de contrato 1:", corpo);
} catch (e) {
  console.log(
    `Resultado do endpoint de contrato 1: FALHOU! Mensagem de erro: ${e}`,
  );
}

try {
  const reqGetContrato = await fetch(
    `http://localhost:${endereco}/contratos/01`,
  );
  const corpo = await reqGetContrato.json();
  console.log("Resultado do endpoint de lista de contratos:", corpo);
} catch (e) {
  console.log(
    `Resultado do endpoint de contratos/01: FALHOU! Mensagem de erro: ${e}`,
  );
}

try {
  const reqNaoExiste = await fetch(`http://localhost:${endereco}/nao-existe`);
  const corpoNaoExiste = await reqNaoExiste.json();
  console.log("Resultado do endpoint de lista de contratos:", corpoNaoExiste);
} catch (e) {
  console.log(
    `Resultado do endpoint de rota inexistente: FALHOU! Mensagem de erro: ${e}`,
  );
}

try {
  const reqQualquerCoisa = await fetch(
    `http://localhost:${endereco}/saude/qualquer-coisa`,
  );
  const corpoQualquerCoisa = await reqQualquerCoisa.json();
  console.log("Resultado do endpoint de Qualquer Coisa:", corpoQualquerCoisa);
} catch (e) {
  console.log(
    `Resultado do endpoint de Qualquer Coisa: FALHOU! Mensagem de erro: ${e}`,
  );
}

// Testes
servidor.close();
