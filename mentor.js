import { perguntarIa } from "./ai.js";
import { mentorIa, mentorDash } from "./prompt.js";
import { renderDashboard } from "./dashboard.js";
import { iniciarLoading, pararLoading } from "./ui.js";


const btnAnalisar = document.querySelector(".enviar");
let isProcessing = false;

btnAnalisar.addEventListener("click", mentor);

// Botão para limpar formulário e resultados (adicionado no HTML)
document.getElementById("limparBtn")?.addEventListener("click", () => {
  document.getElementById("nome").value = "";
  document.getElementById("classe").value = "";
  document.getElementById("curso").value = "";
  document.getElementById("objetivo").value = "";
  document.getElementById("disciplinas").innerHTML = "";
  document.querySelectorAll("select").forEach(s => s.selectedIndex = 0);
  document.querySelector(".answer").innerHTML = "";
  document.querySelector(".answer").classList.remove("show");
  const bars = document.querySelector(".bars");
  if (bars) bars.style.display = 'block';
  document.getElementById("stats").innerHTML = "";
  document.getElementById("grafico").innerHTML = '<div class="bars"></div>';
  localStorage.removeItem("ultimaAnalise");
});

// Recuperar última análise salva ao carregar a página
window.addEventListener("load", () => {
  const saved = localStorage.getItem("ultimaAnalise");
  if (saved) {
    const data = JSON.parse(saved);
    document.querySelector(".answer").innerHTML = data.resposta;
    document.querySelector(".answer").classList.add("show");
    const bars = document.querySelector(".bars");
    if (bars) bars.style.display = 'block';
    renderDashboard(data.dashboard);
  }
});

async function mentor() {
  // Validação básica
  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value.trim();
  const curso = document.getElementById("curso").value.trim();
  if (!nome || !classe || !curso) {
    alert("Preencha pelo menos nome, classe e curso.");
    return;
  }
  
  // Evitar processamento em paralelo
  if (isProcessing) return;
  isProcessing = true;
  btnAnalisar.disabled = true;
  btnAnalisar.textContent = "Analisando...";
  
  const aluno = {
    name: nome,
    classe: classe,
    curso: curso,
    meta: document.getElementById("objetivo").value.trim() || "Não definido",
    notas: formatarNotas()
  };
  
  const loading = iniciarLoading();
  
  try {
    // Primeira chamada: diagnóstico completo
    const resposta = await perguntarIa(mentorIa(aluno), "deepseek-reasoner");
    document.querySelector(".answer").classList.add("show");
    document.querySelector(".answer").innerHTML = marked.parse(resposta);
    const bars = document.querySelector(".bars");
    if (bars) bars.style.display = 'block';
    
    // Segunda chamada: extração dos dados estruturados
    const dash = await perguntarIa(mentorDash(resposta), "deepseek-reasoner");
    const dados = safeParse(dash);
    renderDashboard(dados);
    
    // Salvar no localStorage
    localStorage.setItem("ultimaAnalise", JSON.stringify({
      resposta,
      dashboard: dados
    }));
  } catch (error) {
    document.querySelector(".answer").innerHTML = `<p style="color:red">Erro ao processar a análise. Tente novamente.</p>`;
    console.error(error);
  } finally {
    pararLoading(loading);
    isProcessing = false;
    btnAnalisar.disabled = false;
    btnAnalisar.textContent = "Analisar";
  }
}

// Adicionar disciplinas dinamicamente
document.getElementById("addSubjects").addEventListener("click", () => {
  const container = document.getElementById("disciplinas");
  const div = document.createElement("div");
  div.innerHTML = `<input type="text" placeholder="Disciplina" class="disciplina"> 
    <input type='number' placeholder='Nota' class='nota' min='0' max='20'>`;
  div.classList.add("subjects");
  container.appendChild(div);
});

function formatarNotas() {
  const disciplinas = document.querySelectorAll(".disciplina");
  const notas = document.querySelectorAll(".nota");
  return [...disciplinas].map((d, i) => {
    const n = Number(notas[i].value);
    if (d.value.trim() === "") return "";
    return `${d.value}: ${isNaN(n) ? "0" : n}`;
  }).filter(Boolean).join("\n");
}

function safeParse(text) {
  try {
    // Tenta limpar possíveis resquícios de Markdown (```json) antes do parse
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}