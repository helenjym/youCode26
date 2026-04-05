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
  fetchedShelterEvents = [
    {
      name: 'Group counselling',
      start: '09:00',
      end: '10:00',
      desc: 'A thoughtful, low-pressure space dedicated to acknowledging the anxiety of uncertain times and sharing experiences, centered on active listening and communal support.'
    },
    {
      name: 'Navigating digital resources',
      start: '10:30',
      end: '11:30',
      desc: 'A guided look at how to find and use digital tools for job placement, retraining programs, and community welfare resources.'
    },
    {
      name: 'Lunch',
      start: '12:00',
      end: '13:00',
      desc: 'A free, hot lunch featuring nutritious, comforting flavors, designed to fuel your body and provide a pressure-free space for community.'
    },
    {
      name: 'Yoga',
      start: '13:30',
      end: '14:30',
      desc: 'Clean and sanitize kennels. Replace bedding where needed.'
    },
    {
      name: 'Adoption Event',
      start: '15:00',
      end: '17:00',
      desc: 'A slow-paced, accessible practice focused on "steadying the nervous system" through breath and movement, acknowledging the weight of persistent thoughts while using intentional motion to anchor you in the present.'
    }
  ];

  renderShelterCards();
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

// Remove event from ui and free block list
window.removeEvent = (id) => {
    // 1. Find the event in the main list before deleting it
    const eventToRemove = events.find(e => String(e.id) === String(id));
    
    if (!eventToRemove) return;
  
    // 2. If it's a "Free Block", remove it from the internal minimal array
    // We match by start and end time since the internal objects are minimal
    if (eventToRemove.colorIdx === 7 || eventToRemove.name === "FREE BLOCK") {
      freeBlocks = freeBlocks.filter(block => 
        !(block.start === eventToRemove.start && block.end === eventToRemove.end)
      );
      
      console.log("Internal freeBlocks updated:", freeBlocks);
    }
  
    // 3. Remove from the main events array for the UI
    events = events.filter(e => String(e.id) !== String(id));
    
    renderEvents();
  };

// document.getElementById('add-btn').addEventListener('click', () => {
//   const name = document.getElementById('ev-name').value;
//   const start = document.getElementById('ev-start').value;
//   const end = document.getElementById('ev-end').value;
//   if (name && start && end) {
//     events.push({ id: Date.now(), name, start, end, colorIdx: 0 });
//     renderEvents();
//   }
// });

// Internal arrays
// let events = []; // Full objects for the calendar UI
let freeBlocks = []; // Minimal objects: { start: "HH:MM", end: "HH:MM" }

// Error helper
function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);


}

document.getElementById('free-block-checkbox').addEventListener('change', function() {
  const nameInput = document.getElementById('ev-name');
  if (this.checked) {
    nameInput.value = 'FREE BLOCK';
    nameInput.disabled = true;
  } else {
    nameInput.value = '';
    nameInput.disabled = false;
  }
})

document.getElementById('add-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('ev-name');
    const start = document.getElementById('ev-start').value;
    const end = document.getElementById('ev-end').value;
    const isFreeChecked = document.getElementById('free-block-checkbox').checked;
  
    // 1. Basic Validation
    if (!start || !end) return showError("Please set both times.");
    
    const newStart = timeToMinutes(start);
    const newEnd = timeToMinutes(end);
  
    if (newEnd <= newStart) {
      return showError("Error: End time must be after start time.");
    }
  
    // 2. COLLISION CHECK (If adding a Free Block)
    if (isFreeChecked) {
      // Check if any existing NON-FREE event overlaps with this new slot
      const hasCollision = events.some(ev => {
        // Only care about actual events (colorIdx !== 7)
        if (ev.colorIdx !== 7) {
          const exStart = timeToMinutes(ev.start);
          const exEnd = timeToMinutes(ev.end);
          
          // Overlap logic: (StartA < EndB) AND (EndA > StartB)
          return newStart < exEnd && newEnd > exStart;
        }
        return false;
      });
  
      if (hasCollision) {
        return showError("Cannot add free block: An event is already scheduled here.");
      }
  
      // Also check for duplicate Free Blocks (from previous requirement)
      const isDuplicate = freeBlocks.some(b => b.start === start && b.end === end);
      if (isDuplicate) return showError("This free block already exists.");
    }
  
    // 3. Create the event
    const newEvent = {
      id: Date.now(),
      name: isFreeChecked ? "FREE BLOCK" : nameInput.value.trim() || "Untitled Event",
      start: start,
      end: end,
      colorIdx: isFreeChecked ? 7 : 0 
    };
  
    events.push(newEvent);
  
    // 4. Update internal freeBlocks array
    if (isFreeChecked) {
      freeBlocks.push({ start: start, end: end });
      console.log("Internal Free Blocks:", freeBlocks);
    }
  
    // 5. Reset UI
    nameInput.value = '';
    document.getElementById('free-block-checkbox').checked = false;
    nameInput.disabled = false;
    
    renderEvents();
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

