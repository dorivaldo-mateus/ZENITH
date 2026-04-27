import { perguntarIa } from "./ai.js";
import { promptAula } from "./prompt.js";

let profundidade = "basico";
let ultimaAula = null;

document.querySelectorAll('.depth-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.depth-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    profundidade = btn.dataset.value;
  });
});

document.getElementById('tema').addEventListener('input', function () {
  document.getElementById('temaCount').textContent = `${this.value.length}/120`;
});

//Generate class
document.getElementById('btnGerar').addEventListener('click', gerarAula);

//histórico 
document.getElementById('btnLimparHist').addEventListener('click', limparHistorico);

// função do enter
document.querySelectorAll('input').forEach(inp => {
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') gerarAula();
  });
});

// atualizar histórico ao entrar
renderHistorico();

// ══════════════════════════════════════
async function gerarAula() {
  const tema   = document.getElementById('tema').value.trim();
  const nivel  = document.getElementById('nivel').value.trim();
  const curso  = document.getElementById('curso').value.trim();
  const duracao = document.getElementById('duracao').value;
  const idioma  = document.getElementById('idioma').value;

  const optExemplos    = document.getElementById('optExemplos').checked;
  const optExercicios  = document.getElementById('optExercicios').checked;
  const optTarefa      = document.getElementById('optTarefa').checked;
  const optDica        = document.getElementById('optDica').checked;
  const optCuriosidade = document.getElementById('optCuriosidade').checked;

  // Validação
  let valido = true;
  if (!tema) {
    mostrarErro('temaError', 'tema'); valido = false;
  } else { esconderErro('temaError', 'tema'); }

  if (!nivel) {
    mostrarErro('nivelError', 'nivel'); valido = false;
  } else { esconderErro('nivelError', 'nivel'); }

  if (!curso) {
    mostrarErro('cursoError', 'curso'); valido = false;
  } else { esconderErro('cursoError', 'curso'); }

  if (!valido) return;

  // Bloquear botão
  const btnGerar = document.getElementById('btnGerar');
  btnGerar.disabled = true;

  // Mostrar loading
  const loadingArea = document.getElementById('loadingArea');
  const loadingText = document.getElementById('loadingText');
  loadingArea.style.display = 'flex';
  document.getElementById('resultado').innerHTML = '';

  // Mensagens de loading dinâmicas
  const mensagens = [
    'Zenith está a preparar a sua aula...',
    'Estruturando o conteúdo pedagógico...',
    'Organizando exemplos e exercícios...',
    'Quase pronto, só mais um momento...'
  ];
  let msgIndex = 0;
  const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % mensagens.length;
    loadingText.textContent = mensagens[msgIndex];
  }, 2200);

  try {
    const opcoes = { optExemplos, optExercicios, optTarefa, optDica, optCuriosidade };
    const input = promptAula(tema, nivel, curso, duracao, idioma, profundidade, opcoes);
    const saida = await perguntarIa(input, "deepseek-chat");

    clearInterval(msgInterval);
    loadingArea.style.display = 'none';

    ultimaAula = { tema, nivel, curso, duracao, idioma, profundidade, conteudo: saida, data: new Date().toISOString() };

    // Salvar no histórico
    salvarHistorico(ultimaAula);

    // Renderizar resultado
    renderResultado(ultimaAula);

    MathJax.typeset();

  } catch (err) {
    clearInterval(msgInterval);
    loadingArea.style.display = 'none';
    mostrarToast('⚠️ Erro ao gerar a aula. Verifica a tua conexão.');
    console.error(err);
  }

  btnGerar.disabled = false;
}

// ══════════════════════════════════════
function renderResultado(aula) {
  const durMin = aula.duracao;
  const data   = new Date(aula.data).toLocaleDateString('pt-PT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });

  document.getElementById('resultado').innerHTML = `
    <div class="resultado-header">
      <div class="resultado-meta">
        <span><i class="fa-regular fa-clock"></i>${durMin} min</span>
        <span><i class="fa-solid fa-layer-group"></i>${aula.nivel}</span>
        <span><i class="fa-solid fa-globe"></i>${aula.idioma}</span>
      </div>
      <div class="resultado-meta">${data}</div>
    </div>

    <div class="acoes-resultado">
      <button class="btn-acao btn-copy-main" id="btnCopiar">
        <i class="fa-regular fa-copy"></i> Copiar
      </button>
      <button class="btn-acao" id="btnBaixar">
        <i class="fa-solid fa-download"></i> Baixar
      </button>
      <button class="btn-acao" id="btnImprimir">
        <i class="fa-solid fa-print"></i> Imprimir
      </button>
      <button class="btn-acao" id="btnRegenerar">
        <i class="fa-solid fa-rotate"></i> Regenerar
      </button>
    </div>

    <div class="conteudo" id="conteudoAula">
      ${marked.parse(aula.conteudo)}
    </div>
  `;

  // Eventos dos botões de ação
  document.getElementById('btnCopiar').addEventListener('click', () => {
    const texto = document.getElementById('conteudoAula').innerText;
    navigator.clipboard.writeText(texto);
    mostrarToast('✅ Aula copiada para a área de transferência!');
  });


  document.getElementById('btnRegenerar').addEventListener('click', () => {
    gerarAula();
  });

  // Scroll suave até o resultado
  setTimeout(() => {
    document.getElementById('resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// HISTÓRICO
function salvarHistorico(aula) {
  const hist = JSON.parse(localStorage.getItem('zenith_historico') || '[]');
  hist.unshift({ tema: aula.tema, nivel: aula.nivel, curso: aula.curso, duracao: aula.duracao, idioma: aula.idioma, profundidade: aula.profundidade, conteudo: aula.conteudo, data: aula.data });
  const max10 = hist.slice(0, 10);
  localStorage.setItem('zenith_historico', JSON.stringify(max10));
  renderHistorico();
}

function renderHistorico() {
  const hist = JSON.parse(localStorage.getItem('zenith_historico') || '[]');
  const section = document.getElementById('historicoSection');
  const lista   = document.getElementById('historicoLista');

  if (hist.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  lista.innerHTML = hist.map((a, i) => {
    const data = new Date(a.data).toLocaleDateString('pt-PT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    return `
      <div class="historico-item" data-index="${i}">
        <div class="historico-item-info">
          <span class="historico-item-tema">${a.tema}</span>
          <span class="historico-item-meta">${a.nivel} · ${a.curso} · ${a.duracao}min · ${data}</span>
        </div>
        <i class="fa-solid fa-chevron-right historico-item-icon"></i>
      </div>
    `;
  }).join('');

  lista.querySelectorAll('.historico-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx  = parseInt(item.dataset.index);
      const aula = hist[idx];
      ultimaAula = aula;
      renderResultado(aula);
      MathJax.typeset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function limparHistorico() {
  localStorage.removeItem('zenith_historico');
  renderHistorico();
  mostrarToast('🗑️ Histórico limpo.');
}
function mostrarErro(erroId, inputId) {
  document.getElementById(erroId).classList.add('visible');
  document.getElementById(inputId).classList.add('input-error');
}

function esconderErro(erroId, inputId) {
  document.getElementById(erroId).classList.remove('visible');
  document.getElementById(inputId).classList.remove('input-error');
}

function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
