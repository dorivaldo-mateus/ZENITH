export function renderDashboard(dados) {
  const container = document.getElementById('dashboard');
  if (!container) return;
  
  const { crescimento, prazo_meses, etapas, nivel, consistencia, recomendacao } = dados;
  
  // Criar cards de métricas
  const statsHTML = `
    <div class="card">
      <h3>Crescimento projetado</h3>
      <p class="crescimento">${crescimento || '–'}%</p>
    </div>
    <div class="card">
      <h3>Prazo</h3>
      <p>${prazo_meses || '–'} meses</p>
    </div>
    <div class="card">
      <h3>Etapas</h3>
      <p>${etapas || '–'}</p>
    </div>
    <div class="card">
      <h3>Nível</h3>
      <p>${nivel || '–'}</p>
    </div>
    <div class="card">
      <h3>Consistência</h3>
      <p>${consistencia || '–'}</p>
    </div>
    <div class="card">
      <h3>Recomendação</h3>
      <p style="font-size: 1rem; font-weight: normal;">${recomendacao || 'Nenhuma recomendação fornecida.'}</p>
    </div>
  `;
  
  // Gráfico de evolução
  const graficoContainer = document.getElementById('grafico');
  graficoContainer.innerHTML = ''; // limpa qualquer conteúdo anterior
  
  if (crescimento && prazo_meses) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 300 200");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "200");
    svg.style.display = "block";
    
    // Fundo com grid
    const grid = document.createElementNS(svgNS, "g");
    for (let i = 0; i <= 5; i++) {
      const y = 200 - (i * 40);
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", "30");
      line.setAttribute("y1", y);
      line.setAttribute("x2", "280");
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "rgba(255,255,255,0.08)");
      line.setAttribute("stroke-width", "1");
      grid.appendChild(line);
    }
    svg.appendChild(grid);
    
    // Pontos do gráfico (0% a crescimento% ao longo dos meses)
    const points = [];
    const maxX = prazo_meses;
    const maxY = Math.min(crescimento, 100); // limitar ao topo
    const startX = 30;
    const endX = 280;
    const startY = 190;
    const endY = 10;
    
    // Ponto inicial (0,0)
    points.push({ x: startX, y: startY });
    
    // Ponto final
    const xFinal = endX;
    const yFinal = startY - (startY - endY) * (maxY / 100);
    points.push({ x: xFinal, y: yFinal });
    
    // Criar polyline com animação
    const polyline = document.createElementNS(svgNS, "polyline");
    let pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
    polyline.setAttribute("points", pointsStr);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#7dd3fc");
    polyline.setAttribute("stroke-width", "2");
    polyline.setAttribute("stroke-linecap", "round");
    polyline.setAttribute("stroke-dasharray", "300");
    polyline.setAttribute("stroke-dashoffset", "300");
    polyline.style.animation = "drawLine 2s ease forwards";
    svg.appendChild(polyline);
    
    // Círculo nos pontos
    points.forEach((p, idx) => {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", "#00ffcc");
      circle.style.animation = `fadeIn 1s ease ${idx * 0.5}s forwards`;
      circle.style.opacity = "0";
      svg.appendChild(circle);
    });
    
    // Labels e eixos
    const style = document.createElementNS(svgNS, "style");
    style.textContent = `
      @keyframes drawLine { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `;
    svg.appendChild(style);
    
    graficoContainer.appendChild(svg);
  } else {
    graficoContainer.innerHTML = '<p style="text-align:center; color:#888;">Dados insuficientes para o gráfico</p>';
  }
  
  // Inserir cards
  document.getElementById('stats').innerHTML = statsHTML;
}