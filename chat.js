import { perguntarIa } from "./ai.js";

let dotsInterval;
let historico = []
// LOADING
function startLoading() {
  const loading = document.getElementById("loading");
  const dots = document.getElementById("dots");

  loading.classList.remove("hidden");

  let count = 0;
  dotsInterval = setInterval(() => {
    count = (count + 1) % 4;
    dots.textContent = ".".repeat(count);
  }, 400);
}

function stopLoading() {
  clearInterval(dotsInterval);
  document.getElementById("loading").classList.add("hidden");
}


async function chat() {
  document.querySelector('.show').style.display = 'none'
  const input = document.getElementById("mensagem");
  const chatBox = document.getElementById("chat");

  const mensagem = input.value.trim();
  if (!mensagem) return;
  historico.push({role: 'user', content: mensagem})
  input.value = "";
  chatBox.innerHTML += `<p class="chatUser">${mensagem}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;
  startLoading()
  try {
    const resposta = await perguntarIa(historico, "deepseek-chat");
    historico.push({role: 'assistant', content: resposta})
    chatBox.innerHTML += `<p class="chatSystem">${resposta}</p>`;
  } catch {
    chatBox.innerHTML += `<p class="chatSystem">Erro na IA.</p>`;
    historico.pop()
  }

  stopLoading();
  chatBox.scrollTop = chatBox.scrollHeight;
}

// INIT
document.getElementById("enviar").addEventListener("click", chat);