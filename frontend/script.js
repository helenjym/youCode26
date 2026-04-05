const HOUR_HEIGHT = 52;
const TOTAL_HOURS = 24;
const COLORS = [
  { bg: '#B5D4F4', text: '#0C447C' }, { bg: '#9FE1CB', text: '#085041' },
  { bg: '#F5C4B3', text: '#712B13' }, { bg: '#F4C0D1', text: '#72243E' },
  { bg: '#CECBF6', text: '#3C3489' }, { bg: '#FAC775', text: '#633806' },
  { bg: '#C0DD97', text: '#27500A' }, { bg: '#D3D1C7', text: '#444441' }
];

let events = [];
let fetchedShelterEvents = [];

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'am' : 'pm';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function buildGrid() {
  const grid = document.getElementById('timeline-grid');
  let h = '';
  for (let i = 0; i < TOTAL_HOURS; i++) {
    const label = i === 0 ? '' : (i < 12 ? `${i} am` : i === 12 ? '12 pm' : `${i - 12} pm`);
    h += `<div class="hour-row"><div class="hour-label">${label}</div><div class="hour-line"><div class="half-line"></div></div></div>`;
  }
  grid.innerHTML = h;
  document.getElementById('events-layer').style.height = (TOTAL_HOURS * HOUR_HEIGHT) + 'px';
}

function renderEvents() {
  const layer = document.getElementById('events-layer');
  layer.querySelectorAll('.event-block, .current-time').forEach(e => e.remove());

  const sorted = [...events].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const cols = [];
  sorted.forEach(ev => {
    const sm = timeToMinutes(ev.start), em = timeToMinutes(ev.end);
    let col = 0;
    while (cols[col] && cols[col].some(g => timeToMinutes(g.start) < em && timeToMinutes(g.end) > sm)) col++;
    if (!cols[col]) cols[col] = [];
    cols[col].push(ev);
    ev._col = col;
  });

  const totalCols = cols.length || 1;
  events.forEach(ev => {
    const sm = timeToMinutes(ev.start), em = timeToMinutes(ev.end);
    const top = (sm / 60) * HOUR_HEIGHT;
    const height = Math.max(((em - sm) / 60) * HOUR_HEIGHT, 24);
    const colW = 100 / totalCols;
    const c = COLORS[ev.colorIdx || 0];

    const div = document.createElement('div');
    div.className = 'event-block';
    div.style.cssText = `top:${top}px; height:${height}px; left:calc(${ev._col * colW}% + 6px); width:calc(${colW}% - 12px); background:${c.bg};`;
    div.innerHTML = `
      <div style="overflow:hidden; flex:1;">
        <div class="ev-title" style="color:${c.text}">${ev.name}</div>
        <div class="ev-time" style="color:${c.text}">${formatTime(ev.start)} – ${formatTime(ev.end)}</div>
      </div>
      <button class="event-del-btn" style="color:${c.text}" onclick="removeEvent('${ev.id}')">×</button>
    `;
    layer.appendChild(div);
  });

  const now = new Date();
  const marker = document.createElement('div');
  marker.className = 'current-time';
  marker.style.top = (((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT) + 'px';
  layer.appendChild(marker);
}

async function fetchShelterEvents() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const rawData = await response.json();
    fetchedShelterEvents = rawData.slice(0, 5).map((user, i) => ({
      name: `Shift: ${user.company.bs.split(' ')[0]}`,
      start: `${10 + i}:00`,
      end: `${11 + i}:30`,
      desc: `Task for ${user.name}. Location: ${user.address.street}.`
    }));
    renderShelterCards();
  } catch (e) {
    document.getElementById('shelter-events-container').innerHTML = 'Failed to load.';
  }
}

function renderShelterCards() {
  const container = document.getElementById('shelter-events-container');
  container.innerHTML = fetchedShelterEvents.map((ev, i) => `
    <div class="shelter-card">
      <div style="font-size: 13px; font-weight: 600;">${ev.name}</div>
      <div style="font-size: 11px; color: #888780;">${ev.start} - ${ev.end}</div>
      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <button onclick="toggleDesc(${i})" style="flex:1; font-size:11px; cursor:pointer; background:none; border:1px solid #d3d1c7; border-radius:4px; padding:4px;">Desc</button>
        <button onclick="addShelter(${i})" style="flex:1; font-size:11px; cursor:pointer; background:#1c1c1a; color:#fff; border:none; border-radius:4px; padding:4px;">Add</button>
      </div>
      <div id="desc-${i}" style="display:none; font-size:11px; margin-top:8px; color:#5f5e5a; border-top:1px dashed #eee; padding-top:8px;">${ev.desc}</div>
    </div>
  `).join('');
}

window.toggleDesc = (i) => {
  const el = document.getElementById(`desc-${i}`);
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.addShelter = (i) => {
  const item = fetchedShelterEvents[i];
  events.push({ id: Date.now() + i, name: item.name, start: item.start, end: item.end, colorIdx: 4 });
  renderEvents();
};

window.removeEvent = (id) => {
  events = events.filter(e => String(e.id) !== String(id));
  renderEvents();
};

document.getElementById('add-btn').addEventListener('click', () => {
  const name = document.getElementById('ev-name').value;
  const start = document.getElementById('ev-start').value;
  const end = document.getElementById('ev-end').value;
  if (name && start && end) {
    events.push({ id: Date.now(), name, start, end, colorIdx: 0 });
    renderEvents();
  }
});

document.getElementById('print-btn').addEventListener('click', () => window.print());

buildGrid();
fetchShelterEvents();
renderEvents();
document.getElementById('cal-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

const modal = document.getElementById('free-block-modal');
const freeBlockBtn = document.getElementById('free-block-btn');
const closeModalBtn = document.getElementById('close-modal');
const confirmBtn = document.getElementById('confirm-free-blocks');

// Hide modal on initial load (since we used flex in inline style)
modal.style.display = 'none';

// Open Modal
freeBlockBtn.addEventListener('click', () => {
modal.style.display = 'flex';
});

// Close Modal (Cancel)
closeModalBtn.addEventListener('click', () => {
modal.style.display = 'none';
});

// Close Modal if clicking outside the white box
window.addEventListener('click', (event) => {
if (event.target === modal) {
  modal.style.display = 'none';
}
});

// Action when "Generate Blocks" is clicked
confirmBtn.addEventListener('click', () => {
// Add your logic here to find gaps and push to the 'events' array
console.log("Generating free blocks...");

// Example logic:
// 1. Sort existing events
// 2. Find time gaps between 09:00 and 17:00
// 3. events.push(...) those gaps

modal.style.display = 'none';
renderEvents();
});
