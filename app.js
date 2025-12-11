document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const permissions = localStorage.getItem('permissions');
  const grid = document.querySelector('.item-grid');
  const addForm = document.getElementById('addTrinketForm');

  async function loadTrinkets() {
    try {
      const res = await fetch('http://localhost:3000/trinkets');
      const trinkets = await res.json();

      grid.innerHTML = '';

      trinkets.forEach(trinket => {
        const card = document.createElement('div');
        card.classList.add('item');
        card.innerHTML = `
  <div class="trinket-card" data-trinket-id="${trinket.trinketId}">
    <img src="${trinket.trinketUrl || 'default.png'}" 
      alt="${trinket.trinketName}" 
      class="trinket-image">
    <h3>${trinket.trinketName}</h3>
    <p><strong>Brand:</strong> ${trinket.trinketBrand}</p>
    <p><strong>Color:</strong> ${trinket.trinketColor}</p>
    <p><strong>Series:</strong> ${trinket.trinketSeries}</p>
    <p><strong>Release:</strong> ${trinket.trinketRelease || 'N/A'}</p>
    <button class="add-btn">+</button>
  </div>`;
        grid.appendChild(card);

        const button = card.querySelector('.add-btn');
        const trinketId = card.querySelector('.trinket-card').dataset.trinketId;
        button.addEventListener('click', async () => {
          if (!button.classList.contains('expanded')) {
            button.classList.add('expanded');
            return;
          }
          if (!userId) {
            alert("You must be logged in to add to your collection.");
            return;
          }
          const res = await fetch('http://localhost:3000/usertrinkets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, trinketId })
          });
          const result = await res.json();
          if (res.ok) {
            button.classList.remove('expanded');
          } else {
            alert(result.message || 'Failed to add trinket');
          }
        });
      });
    } catch (err) {
      console.error('Error fetching trinkets:', err);
    }
  }
  loadTrinkets();

  if (permissions === 'admin' && addForm) {
    addForm.style.display = 'block';

    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const trinketReleaseInput = document.getElementById('trinketRelease').value;
      const trinketData = {
        userId,
        trinketName: document.getElementById('trinketName').value,
        trinketBrand: document.getElementById('trinketBrand').value,
        trinketColor: document.getElementById('trinketColor').value,
        trinketSeries: document.getElementById('trinketSeries').value,
        trinketRelease: trinketReleaseInput.trim() === '' ? null : trinketReleaseInput,
        trinketUrl: document.getElementById('trinketUrl').value
      };

      const res = await fetch('http://localhost:3000/trinkets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trinketData)
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        addForm.reset();
        loadTrinkets();
      } else {
        alert(result.message || 'Failed to add trinket');
      }
    });
  }
});