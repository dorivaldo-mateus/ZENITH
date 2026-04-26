import { perguntarIa } from "./ai.js";
import { mentorIa, mentorDash } from "./prompt.js";
import { renderDashboard } from "./dashboard.js";
import { iniciarLoading, pararLoading } from "./ui.js";

function pegarDiagnostico() {
  return `
- Esquece conteúdo: ${document.getElementById('q1').value}
- Dificuldade escrita: ${document.getElementById('q2').value}
- Falta de atenção: ${document.getElementById('q3').value}
- Prefere exemplos: ${document.getElementById('q4').value}
`;
}

document.querySelector(".enviar").addEventListener("click", mentor);

async function mentor() {
  const aluno = {
    name: document.getElementById("nome").value,
    classe: document.getElementById("classe").value,
    curso: document.getElementById("curso").value,
    meta: document.getElementById("objetivo").value,
    comportamento: pegarDiagnostico(),
    notas: formatarNotas()
  };

  const loading = iniciarLoading();

  const resposta = await perguntarIa(mentorIa(aluno), "deepseek-reasoner");
  document.querySelector(".answer").classList.add('show')
  document.querySelector(".answer").innerHTML = marked.parse(resposta);
  pararLoading(loading);

  const dash = await perguntarIa(mentorDash(resposta), "deepseek-reasoner");
  const dados = safeParse(dash);
  document.querySelector(".bars").style.display = 'block'
  renderDashboard(dados);
  
  
}
document.getElementById('addSubjects').addEventListener('click', function (){
  const container = document.getElementById('disciplinas')
  const div = document.createElement('div')
  div.innerHTML = `<input type="text" placeholder="Disciplina" class="disciplina"> 
    <input type='number' placeholder='Nota' class='nota'>`
    div.classList.add('subjects')
  container.appendChild(div)
})
function formatarNotas() {
  const disciplinas = document.querySelectorAll(".disciplina");
  const notas = document.querySelectorAll(".nota");

  return [...disciplinas].map((d, i) => {
    const n = Number(notas[i].value);
    return `${d.value}: ${n}`;
  }).join("\n");
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}