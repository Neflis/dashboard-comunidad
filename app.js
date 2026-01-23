async function main() {
  const res = await fetch('./data.json');
  const data = await res.json();

  // Último mes (el más reciente en el array)
  const last = data[data.length - 1];
  const prev = data.length >= 2 ? data[data.length - 2] : null;


  // KPIs
  const pct = last.fees_issued ? (last.fees_collected / last.fees_issued) * 100 : 0;

  document.getElementById('kpi-saldo').textContent = `${last.bank_balance.toFixed(0)} €`;
  document.getElementById('kpi-emitido').textContent = `${last.fees_issued.toFixed(0)} €`;
  document.getElementById('kpi-cobrado').textContent = `${last.fees_collected.toFixed(0)} €`;
  document.getElementById('kpi-pct').textContent = `${pct.toFixed(1)} %`;
  document.getElementById('kpi-gastos').textContent = `${last.expenses_total.toFixed(0)} €`;
  document.getElementById('kpi-agua').textContent = `${last.water_m3.toFixed(0)} m³ / ${last.water_eur.toFixed(0)} €`;
  document.getElementById('kpi-incidencias').textContent = `${last.incidents_count} / ${last.incidents_cost.toFixed(0)} €`;

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


  // Datos para la gráfica
  const labels = data.map(d => d.month);
  const cobrado = data.map(d => d.fees_collected);
  const emitido = data.map(d => d.fees_issued);
  const gastos = data.map(d => d.expenses_total);
  const saldo = data.map(d => d.bank_balance);

  const ctx = document.getElementById('chart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Cobrado', data: cobrado },
        { label: 'Emitido', data: emitido },
        { label: 'Gastos', data: gastos },
        { label: 'Saldo', data: saldo, type: 'line', yAxisID: 'y1' }
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

main().catch(console.error);
