const priorityColors = {
  High: '#f8d7da',
  Medium: '#fff3cd',
  Low: '#d1e7dd'
};

function showAddActivityForm() {
  document.getElementById('add-activity-form').style.display = 'block';
  document.getElementById('add-activity-btn').style.display = 'none';
}

function cancelAddActivity() {
  document.getElementById('add-activity-form').style.display = 'none';
  document.getElementById('add-activity-btn').style.display = 'block';
  document.getElementById('activity-input').value = '';
  document.getElementById('priority-input').value = '';
}

let activityData = [];

function confirmAddActivity() {
  const activity = document.getElementById('activity-input').value.trim();
  const priority = document.getElementById('priority-input').value;

  if (!activity || !priority) return;

  activityData.push({ name: activity, priority });
  console.log(activityData);

  const list = document.getElementById('activity-list');

  const card = document.createElement('div');
  card.style.cssText = `
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px; border-radius: 8px; font-size: 14px;
    background-color: ${priorityColors[priority]};
    border: 1px solid #e0e0e0;
    position: relative;
  `;
  card.innerHTML = `
  <span style="font-weight: 500;">${activity}</span>
  <div style="display: flex; align-items: center; gap: 10px;">
    <span style="font-size: 12px; color: #555;">${priority}</span>
    <button onclick="deleteActivity(this)" style="
      background: none; border: none; cursor: pointer;
      font-size: 12px; color: #888; line-height: 1; padding: 0;
    ">✕</button>
  </div>
`;

  list.appendChild(card);
  cancelAddActivity();
}

async function closeFreeBlockModal() {
  document.getElementById('free-block-modal').style.display = 'none';

  if (activityData.length === 0 || freeBlocks.length === 0) {
    console.warn('No activities or free blocks to schedule');
    return;
  }

  const message = `
    I have the following free time blocks: ${JSON.stringify(freeBlocks)}.
    I want to fill them with these activities and priorities: ${JSON.stringify(activityData)}.
    I do not need to fill up all my free time blocks.
    Assign each activity to a free block. Return a JSON array where each object has start_time, end_time, activity, priority.
  `;

  try {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const result = await response.json();
    console.log('Scheduled activities:', result);

    // Remove all existing free blocks from the calendar
    events = events.filter(e => e.colorIdx !== 7 && e.name !== 'FREE BLOCK');
    freeBlocks = [];

    // Add the new scheduled activities
    result.forEach(item => {
      events.push({
        id: Date.now() + Math.random(),
        name: item.activity,
        start: item.start_time,
        end: item.end_time,
        colorIdx: 5
      });
    });

    renderEvents();

  } catch (err) {
    console.error('Error scheduling activities:', err);
  }

  activityData = [];
}

function deleteActivity(btn) {
  const card = btn.parentElement.parentElement;
  const name = card.querySelector('span:first-child').textContent;
  activityData = activityData.filter(a => a.name !== name);
  card.remove();
  console.log(activityData);
}