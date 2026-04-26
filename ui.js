export function iniciarLoading() {
  const status = document.getElementById("status");
  const estados = [
    "A analisar dados...",
    "A identificar padrões...",
    "A estruturar plano...",
    "A otimizar estratégia..."
  ];

  let i = 0;

  status.classList.add("status");

  const intervalo = setInterval(() => {
    status.textContent = estados[i];
    i = (i + 1) % estados.length;
  }, 1500);

  return intervalo;
}

export function pararLoading(intervalo) {
  clearInterval(intervalo);
  const status = document.getElementById("status");
  status.textContent = "";
  status.classList.remove("status");
}