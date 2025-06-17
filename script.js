// Cálculos de factorial y combinatoria
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
function comb(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}
function negBinomPMF(k, r, p) {
  const x = k - r;
  return comb(x + r - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, x);
}

let chart, historyCount = 0;

// Dibuja la gráfica de PMF
function renderChart(r, p) {
  const mean = r / p;
  const maxK = Math.ceil(r + 5 * mean);
  const labels = [], data = [];
  for (let k = r; k <= maxK; k++) {
    labels.push(k);
    data.push(negBinomPMF(k, r, p));
  }
  const ctx = document.getElementById('pmfChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: `PMF (r=${r}, p=${p})`, data, backgroundColor: 'rgba(0,102,204,0.6)' }] },
    options: { responsive: true, animation: { duration: 1000 } }
  });
}

// Teórico
document.getElementById('btn-calc').addEventListener('click', () => {
  const r = +document.getElementById('input-r').value;
  const p = +document.getElementById('input-p').value;
  document.getElementById('theo-mean').textContent = (r / p).toFixed(2);
  document.getElementById('theo-std').textContent = Math.sqrt((r * (1 - p)) / (p * p)).toFixed(2);
  renderChart(r, p);
});

// Simulación + cinta dinámica
document.getElementById('btn-sim').addEventListener('click', () => {
  const r = +document.getElementById('input-r').value;
  const p = +document.getElementById('input-p').value;
  const N = +document.getElementById('input-nsim').value;
  const belt = document.getElementById('belt');

  // Reiniciar cinta y animación
  belt.innerHTML = '';
  belt.style.animation = 'none';
  void belt.offsetWidth;
  belt.style.animation = 'scrollBelt 8s linear infinite';

  // Construir cinta hasta r defectuosas
  let defects = 0;
  while (defects < r) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    if (Math.random() < p) {
      piece.classList.add('defective');
      defects++;
    }
    belt.appendChild(piece);
  }

  // Monte Carlo
  let sum = 0;
  for (let i = 0; i < N; i++) {
    let tempDef = 0, tempCount = 0;
    while (tempDef < r) {
      tempCount++;
      if (Math.random() < p) tempDef++;
    }
    sum += tempCount;
  }
  const simMean = (sum / N).toFixed(2);
  document.getElementById('sim-mean').textContent = simMean;

  // Historial
  historyCount++;
  document.getElementById('historyBody').insertAdjacentHTML(
    'beforeend',
    `<tr><td>${historyCount}</td><td>${simMean}</td><td>${N}</td></tr>`
  );
});

// Exportar CSV
document.getElementById('btn-export').addEventListener('click', () => {
  let csv = 'Simulación,Media Simulada,Simulaciones\n';
  document.querySelectorAll('#historyBody tr').forEach(row => {
    const [i, m, n] = [...row.querySelectorAll('td')].map(td => td.innerText);
    csv += `${i},${m},${n}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'historial_simulaciones.csv';
  link.click();
});

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Reiniciar Página
document.getElementById('btn-reset').addEventListener('click', () => {
  document.getElementById('input-r').value = 5;
  document.getElementById('input-p').value = 0.02;
  document.getElementById('input-nsim').value = 10000;
  document.getElementById('theo-mean').textContent = '–';
  document.getElementById('theo-std').textContent = '–';
  document.getElementById('sim-mean').textContent = '–';
  document.getElementById('historyBody').innerHTML = '';
  document.getElementById('belt').innerHTML = '';
  if (chart) chart.destroy();
});
