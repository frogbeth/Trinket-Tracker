document.addEventListener('DOMContentLoaded', () => {
  const postFeed = document.querySelector('.post-feed');
  const toggleBtn = document.getElementById('toggle-post-btn');
  const createPostSection = document.getElementById('create-post');
  const postForm = document.getElementById('create-post-form');
  const trinketSelect = document.getElementById('trinket-select');
  const postText = document.getElementById('post-text');
  const imageUrlInput = document.getElementById('image-url');
  const userId = localStorage.getItem('userId');

  fetch('http://localhost:3000/posts')
    .then(res => res.json())
    .then(posts => {
      postFeed.innerHTML = '';
      posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
          <div class="post-header">
            <div class="user-avatar"><i class="fas fa-user"></i></div>
            <div class="user-info">
              <h3 class="username">${post.username}</h3>
            </div>
          </div>
          <div class="post-content">
            <p>${post.postText}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-image">` : ''}
          </div>`;
        postFeed.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error loading posts:', err);
      postFeed.innerHTML = '<p>Failed to load posts.</p>';
    });

  fetch('http://localhost:3000/trinkets')
    .then(res => res.json())
    .then(trinkets => {
      trinketSelect.innerHTML = '';
      trinkets.forEach(trinket => {
        const option = document.createElement('option');
        option.value = trinket.trinketId;
        option.textContent = trinket.trinketName;
        trinketSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Error loading trinkets:', err);
      trinketSelect.innerHTML = '<option disabled>Failed to load trinkets</option>';
    });

  toggleBtn.addEventListener('click', () => {
    if (!userId) {
      alert("You must be logged in to create a post.");
      return;
    }
    if (createPostSection.style.display === 'none') {
      createPostSection.style.display = 'block';
      toggleBtn.textContent = 'Cancel';
    } else {
      createPostSection.style.display = 'none';
      toggleBtn.textContent = '+ New Post';
    }
  });

  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const trinketId = trinketSelect.value;
    const text = postText.value.trim();
    const imageUrl = imageUrlInput.value.trim();

    if (!userId || !trinketId || !text) return;

    const res = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, trinketId, postText: text, imageUrl })
    });

    const result = await res.json();
    if (res.ok) {
      alert('Post created!');
      postForm.reset();
      location.reload();
    } else {
      alert(result.message || 'Failed to post');
    }
  });
});
