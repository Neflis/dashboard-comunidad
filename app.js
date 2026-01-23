async function main() {
  const res = await fetch('./data.json');
  const data = await res.json();

  monthSelect.innerHTML = '';

  const monthSelect = document.getElementById('monthSelect');
  if (!monthSelect) {
    console.error('No encuentro <select id="monthSelect">. Revisa index.html');
    return;
  }

  // Rellenar select con meses
  data.forEach((d, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = d.month;
    monthSelect.appendChild(opt);
  });

  // Por defecto: último mes
  monthSelect.value = String(data.length - 1);

   function renderKpis(index) {
    const last = data[index];
    const prev = index > 0 ? data[index - 1] : null;

    const pct = last.fees_issued ? (last.fees_collected / last.fees_issued) * 100 : 0;

    document.getElementById('kpi-saldo').textContent = `${last.bank_balance.toFixed(0)} €`;
    document.getElementById('kpi-emitido').textContent = `${last.fees_issued.toFixed(0)} €`;
    document.getElementById('kpi-cobrado').textContent = `${last.fees_collected.toFixed(0)} €`;
    document.getElementById('kpi-pct').textContent = `${pct.toFixed(1)} %`;

    document.getElementById('kpi-gastos').textContent = `${last.expenses_total.toFixed(0)} €`;

    if (prev) {
      const pctPrev = prev.fees_issued ? (prev.fees_collected / prev.fees_issued) * 100 : 0;
      document.getElementById('kpi-emitido-prev').textContent = `${prev.fees_issued.toFixed(0)} €`;
      document.getElementById('kpi-cobrado-prev').textContent = `${prev.fees_collected.toFixed(0)} €`;
      document.getElementById('kpi-pct-prev').textContent = `${pctPrev.toFixed(1)} %`;
    } else {
      document.getElementById('kpi-emitido-prev').textContent = `—`;
      document.getElementById('kpi-cobrado-prev').textContent = `—`;
      document.getElementById('kpi-pct-prev').textContent = `—`;
    }
  }

  // Pintar KPIs del mes seleccionado por defecto
  renderKpis(data.length - 1);

  // Cambiar KPIs al cambiar mes
  monthSelect.addEventListener('change', (e) => {
    const idx = Number(e.target.value);
    renderKpis(idx);
    chart.destroy();
    chart = buildChart(idx);
  });

  function getWindow6(index) {
    const start = Math.max(0, index - 5);
    const slice = data.slice(start, index + 1);
    return {
      labels: slice.map(d => d.month),
      emitido: slice.map(d => d.fees_issued),
      cobrado: slice.map(d => d.fees_collected),
      gastos: slice.map(d => d.expenses_total),
      saldo: slice.map(d => d.bank_balance)
    };
  }

  const ctx = document.getElementById('chart');

  function buildChart(index) {
    const w = getWindow6(index);

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: w.labels,
        datasets: [
          { label: 'Emitido', data: w.emitido },
          { label: 'Recaudado', data: w.cobrado },
          { label: 'Gastos', data: w.gastos },
          { label: 'Saldo', data: w.saldo, type: 'line', yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: '€ (mes)' } },
          y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: '€ (saldo)' } }
        }
      }
    });
  }

  let chart = buildChart(data.length - 1);

}

main().catch(console.error);
