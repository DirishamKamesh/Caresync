/**
 * CareSync — Chart.js Setup
 * charts.js: Bar (appointments/7 days) + Doughnut (status breakdown)
 */

function initCharts(appointments) {
  if (!window.Chart) return;

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#a3b5b2' : '#3e4947';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.color = textColor;

  // --- BAR CHART: Appointments per day (last 7 days) ---
  const barCtx = document.getElementById('chart-bar');
  if (barCtx) {
    const labels = [];
    const data   = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      labels.push(d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }));
      data.push(appointments.filter(a => new Date(a.date_time).toDateString() === dayStr).length);
    }

    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Appointments',
          data,
          backgroundColor: 'rgba(0,92,85,0.75)',
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: '#005c55',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#111c1b' : '#fff',
            titleColor: isDark ? '#e8f0ee' : '#181c1c',
            bodyColor: isDark ? '#a3b5b2' : '#3e4947',
            borderColor: isDark ? '#1e2d2c' : '#e8eeec',
            borderWidth: 1,
            padding: 10,
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { stepSize: 1, font: { size: 11 } }, beginAtZero: true }
        }
      }
    });
  }

  // --- DOUGHNUT CHART: Status breakdown ---
  const doughCtx = document.getElementById('chart-doughnut');
  if (doughCtx) {
    const statuses = ['Pending','Approved','Rejected','Completed'];
    const colors   = ['#f59e0b','#22c55e','#ef4444','#3b82f6'];
    const counts   = statuses.map(s => appointments.filter(a => a.status === s).length);
    const total    = counts.reduce((a,b) => a+b, 0);

    new Chart(doughCtx, {
      type: 'doughnut',
      data: {
        labels: statuses,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} (${total ? Math.round(ctx.parsed/total*100) : 0}%)`
            }
          }
        }
      }
    });

    // Custom legend
    const legend = document.getElementById('doughnut-legend');
    if (legend) {
      legend.innerHTML = statuses.map((s, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="width:10px;height:10px;border-radius:50%;background:${colors[i]};flex-shrink:0"></div>
            <span style="color:${textColor}">${s}</span>
          </div>
          <strong style="color:${isDark?'#e8f0ee':'#181c1c'}">${counts[i]}</strong>
        </div>`).join('');
    }
  }

  // --- LINE CHART for doctor dashboard ---
  const lineCtx = document.getElementById('chart-line');
  if (lineCtx) {
    const labels = [];
    const data   = [];
    const user   = Auth.getSession();
    const dId    = user?.linkedProfileId;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      labels.push(d.toLocaleDateString('en-GB', { weekday: 'short' }));
      data.push(appointments.filter(a => new Date(a.date_time).toDateString() === dayStr && (!dId || a.doctor_id === dId)).length);
    }

    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Appointments',
          data,
          borderColor: '#005c55',
          backgroundColor: 'rgba(0,92,85,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#005c55',
          pointRadius: 4,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { stepSize: 1 }, beginAtZero: true }
        }
      }
    });
  }
}

window.initCharts = initCharts;
