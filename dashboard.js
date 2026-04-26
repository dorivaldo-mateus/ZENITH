const cores = {
  prazo: "#ffaa00",
  crescimento: "#00ffcc",

  etapas: "#ff4d4d"
};

export function renderDashboard(data) {
  renderCards(data);
  renderGrafico(data);
}

function renderCards(data) {
  const container = document.getElementById("stats");
  container.innerHTML = "";
  const nomes = ["prazo", "crescimento", "etapas"];
  const cards = [
    { titulo: "Prazo", valor: data.prazo_meses },
    { titulo: "Crescimento", valor: data.crescimento },
    { titulo: "Etapas", valor: data.etapas },
    { titulo: "Nível", valor: data.nivel }
  ];

  cards.forEach((c, i) => {
    const div = document.createElement("div");
    div.classList.add("card");

    div.style.borderLeft = `4px solid ${cores[c.titulo.toLowerCase()] || "#ccc"}`;

    div.innerHTML = `
      <h2>${c.titulo}</h2>
      <p class = '${nomes[i]}'>${c.valor}</p>
    `;

    container.appendChild(div);
  });
}
function normalizar(valor, max = 100) {
  let v = Number(valor);
  if (isNaN(v)) return 0;
  return Math.min(v, max);
}

function renderGrafico(data) {
  const container = document.querySelector(".bars");
  container.innerHTML = "";

  const prazo = normalizar(data.prazo_meses * 10);
const etapas = normalizar(data.etapas * 10);
const crescimento = normalizar(data.crescimento);

const point = document.createElement("div");
point.classList.add("point");
point.style.left = prazo + "%";
point.style.bottom = etapas + "%";

const line = document.createElement("div");
line.classList.add("line");

const angle = (crescimento / 100) * 90;

const containerRect = container.getBoundingClientRect();

const pxPrazo = (prazo / 100) * containerRect.width;
const pxEtapas = (etapas / 100) * containerRect.height;

const length = Math.sqrt(pxPrazo ** 2 + pxEtapas ** 2);

line.style.width = length + "px";
line.style.transform = `rotate(${-angle}deg)`;

line.style.height = (1 + crescimento / 25) + "px";
line.style.background = `hsl(${120 + crescimento}, 100%, 50%)`;
  container.appendChild(line);
  container.appendChild(point);
}