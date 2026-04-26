import {perguntarIa} from "./ai.js";
import { promptAula } from "./prompt.js";
document.getElementById('btnGerar').addEventListener('click', gerar);
async function gerar(){
  
  document.querySelector('.processar').classList.add('processando')
  
const tema = document.getElementById("tema").value;
const nivel = document.getElementById("nivel").value
const curso = document.getElementById("curso").value
const input = promptAula(tema, nivel, curso);
const saida = await perguntarIa(input, "deepseek-chat");
  document.querySelector('.processar').classList.remove('processando')
document.getElementById("resultado").innerHTML = `
  <div class="conteudo">${marked.parse(saida)}</div>
  <i class="fa-regular fa-copy btn-copy"></i>
`;
MathJax.typeset()
document.querySelector(".btn-copy").addEventListener("click", function () {
  const texto = this.previousElementSibling.innerText;
  navigator.clipboard.writeText(texto)
});

}
