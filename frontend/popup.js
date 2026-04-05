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

function confirmAddActivity() {
  const activity = document.getElementById('activity-input').value.trim();
  const priority = document.getElementById('priority-input').value;

  if (!activity || !priority) return;

  const list = document.getElementById('activity-list');

  const card = document.createElement('div');
  card.style.cssText = `
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px; border-radius: 8px; font-size: 14px;
    background-color: ${priorityColors[priority]};
    border: 1px solid #e0e0e0;
  `;
  card.innerHTML = `
    <span style="font-weight: 500;">${activity}</span>
    <span style="font-size: 12px; color: #555;">${priority}</span>
  `;

  list.appendChild(card);
  cancelAddActivity();
}

function closeFreeBlockModal() {
  document.getElementById('free-block-modal').style.display = 'none';
}