document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const userName = document.getElementById('profile-username');
  const bioText = document.getElementById('profile-bio');
  const updateBtn = document.getElementById('update-bio-btn');
  const bioEditDiv = document.getElementById('bio-edit');
  const bioInput = document.getElementById('bio-input');
  const saveBtn = document.getElementById('save-bio-btn');
  const grid = document.querySelector('#profile-collection .item-grid');
  const trinketCount = document.getElementById('trinket-count');

  if (!userId) {
    alert('Please log in to view your profile.');
    window.location.href = 'login.html';
    return;
  }

  if (userName) userName.textContent = username + "'s Collection";

  fetch(`http://localhost:3000/profile/${userId}`)
    .then(res => res.json())
    .then(data => {
      bioText.textContent = data.bioMessage || 'No bio yet';
    })
    .catch(err => console.error('Error fetching profile:', err));

  fetch(`http://localhost:3000/profile/${userId}/count`)
    .then(res => res.json())
    .then(data => {
      console.log('Trinket count data:', data);
      trinketCount.textContent = `Trinkets collected: ${data.trinketCount}`;
    })
    .catch(err => console.error('Error fetching trinket count:', err));

  fetch(`http://localhost:3000/profile/${userId}/collection`)
    .then(res => res.json())
    .then(collection => {
      grid.innerHTML = '';
      if (collection.length === 0) {
        grid.innerHTML = '<p>No trinkets in your collection yet.</p>';
        return;
      }
      collection.forEach(trinket => {
        const card = document.createElement('div');
        card.classList.add('item');
        card.innerHTML = `
    <div class="trinket-card">
      <img src="${trinket.trinketUrl || 'default.png'}" 
        alt="${trinket.trinketName}" 
        class="trinket-img" />
      <h3>${trinket.trinketName}</h3>
      <p><strong>Brand:</strong> ${trinket.trinketBrand}</p>
      <p><strong>Color:</strong> ${trinket.trinketColor}</p>
      <p><strong>Series:</strong> ${trinket.trinketSeries}</p>
      <p><strong>Release:</strong> ${trinket.trinketRelease || 'N/A'}</p>
    </div>`;
        grid.appendChild(card);
      });
    })
    .catch(err => console.error('Error fetching collection:', err));

  updateBtn.addEventListener('click', () => {
    bioEditDiv.style.display = 'block';
    bioInput.value = bioText.textContent;
    updateBtn.style.display = 'none';
  });

  saveBtn.addEventListener('click', async () => {
    const newBio = bioInput.value.trim();
    if (!newBio) return;
    try {
      const res = await fetch(`http://localhost:3000/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bioMessage: newBio })
      });
      if (res.ok) {
        bioText.textContent = newBio;
        bioEditDiv.style.display = 'none';
        updateBtn.style.display = 'inline-block';
      }
    } catch (err) {
      console.error('Bio update error:', err);
    }
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('userId');
  const editBtn = document.getElementById('editCollectionBtn');
  const grid = document.querySelector('.item-grid');
  let editMode = false;

  async function loadCollection() {
    const res = await fetch(`http://localhost:3000/profile/${userId}/collection`);
    const collection = await res.json();

    grid.innerHTML = '';

    collection.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('trinket-card');
      card.innerHTML = `
      <img src="${item.trinketUrl || 'default.png'}" 
        alt="${item.trinketName}" 
        class="trinket-img" />
      <h3>${item.trinketName}</h3>
      <p><strong>Brand:</strong> ${item.trinketBrand}</p>
      <p><strong>Color:</strong> ${item.trinketColor}</p>
      <p><strong>Series:</strong> ${item.trinketSeries}</p>
      <p><strong>Release:</strong> ${item.trinketRelease || 'N/A'}</p>
  ${editMode ? `<button class="remove-btn" data-id="${item.collectId}">Remove</button>` : ''}`;
      grid.appendChild(card);

      if (editMode) {
        const removeBtn = card.querySelector('.remove-btn');
        removeBtn.addEventListener('click', async () => {
          const res = await fetch(`http://localhost:3000/usertrinkets/${item.collectId}`, {
            method: 'DELETE'
          });
          const result = await res.json();
          if (res.ok) {
            alert(result.message);
            loadCollection();
          } else {
            alert(result.message || 'Failed to remove trinket');
          }
        });
      }
    });
  }

  loadCollection();

  editBtn.addEventListener('click', () => {
    editMode = !editMode;
    editBtn.textContent = editMode ? 'Done Editing' : 'Edit Collection';
    loadCollection();
  });
});