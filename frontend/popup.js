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

function closeFreeBlockModal() {
  document.getElementById('free-block-modal').style.display = 'none';
}

function deleteActivity(btn) {
  const card = btn.parentElement.parentElement;
  const name = card.querySelector('span:first-child').textContent;
  activityData = activityData.filter(a => a.name !== name);
  card.remove();
  console.log(activityData);
}