import { createServer } from "node:http";

const servidor = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/hora") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(new Date().toISOString());
    return;
  }
  res.statusCode = 404;
  res.end();
});

servidor.listen(4000, () => console.log("ouvindo na 4000"));
