/* global dscc */
let intervalId = null;

function render(data) {
  const el = document.getElementById('app');
  el.innerHTML = '';

  const style = data.style || {};
  const is24h = style.is24h ?? true;
  const showDate = style.showDate ?? true;
  const color = style.fontColor || '#111';
  const fontSize = (style.fontSize || 22) + 'px';
  const title = style.title || 'World Clock';

  const container = document.createElement('div');
  container.className = 'container';
  container.style.color = color;
  container.style.fontSize = fontSize;

  const h = document.createElement('div');
  h.className = 'title';
  h.textContent = title;
  container.appendChild(h);

  const head = document.createElement('div');
  head.className = 'head';
  head.innerHTML = '<div>Ubicación</div><div style="text-align:right">Hora</div>';
  container.appendChild(head);

  // Build rows
  const rowsData = (data.tables?.DEFAULT?.rows || []).map(r => {
    // Works whether columns come named or positional
    const label = r['label']?.[0] ?? r[0];
    const tz = r['tz']?.[0] ?? r[1];
    return { label, tz };
  });

  const nodes = rowsData.map(({ label, tz }) => {
    const row = document.createElement('div');
    row.className = 'row';

    const city = document.createElement('div');
    city.className = 'city';
    city.textContent = label;

    const timeWrap = document.createElement('div');
    timeWrap.className = 'time';
    const time = document.createElement('div');
    time.setAttribute('data-tz', tz);
    const date = document.createElement('div');
    date.className = 'date';
    date.setAttribute('data-tz', tz);
    if (!showDate) date.style.display = 'none';

    timeWrap.appendChild(time);
    timeWrap.appendChild(date);

    row.appendChild(city);
    row.appendChild(timeWrap);
    container.appendChild(row);

    return { timeNode: time, dateNode: date, tz };
  });

  el.appendChild(container);

  const tick = () => {
    const now = new Date();
    nodes.forEach(({ timeNode, dateNode, tz }) => {
      try {
        const timeOpts = { timeZone: tz, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: !is24h };
        const dateOpts = { timeZone: tz, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        timeNode.textContent = new Intl.DateTimeFormat(undefined, timeOpts).format(now);
        dateNode.textContent = new Intl.DateTimeFormat(undefined, dateOpts).format(now);
      } catch {
        timeNode.textContent = 'TZ inválida';
        dateNode.textContent = tz;
      }
    });
  };

  if (intervalId) clearInterval(intervalId);
  tick();
  intervalId = setInterval(tick, 1000);
}

function draw(d) { render(d); }
function update(d) { render(d); }

const root = document.createElement('div');
root.id = 'app';
document.body.appendChild(root);

if (window.dscc) {
  dscc.subscribeToData(draw, { transform: dscc.objectTransform });
} else {
  // Local dev preview
  document.addEventListener('DOMContentLoaded', () => {
    render({
      tables: { DEFAULT: { rows: [
        { label:['Lima (Perú)'], tz:['America/Lima'] },
        { label:['New York (NY)'], tz:['America/New_York'] }
      ] } },
      style: { is24h: true, showDate: true }
    });
  });
}
