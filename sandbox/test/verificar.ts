export function verificar(descricao: string, condicao: boolean): void {
  if (condicao) {
    console.log("OK", descricao);
  } else {
    console.log("FALHOU", descricao);
  }
}

export function verificarErro(descricao: string, fn: () => void): void {
  try {
    fn();
    console.log("FALHOU", descricao);
  } catch (e) {
    if (e instanceof Error) {
      console.log("OK", e.message, "com descrição de:", descricao);
    } else {
      console.log("OK", String(e));
    }
  }
}
