// login.html (login) js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const userData = {
                username: formData.get('username'),
                password: formData.get('password'),
            };

            try {
                const res = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                const result = await res.json();
                if (res.ok) {
                    localStorage.setItem('userId', result.user.userId);
                    localStorage.setItem('username', result.user.username);
                    localStorage.setItem('permissions', result.user.permissions);
                    alert('Login success. Welcome, ' + result.user.username + '!');
                    loginForm.reset();
                    window.location.href = 'index.html';
                } else {
                    alert(result.message || 'Invalid username or password. Please try again.');
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('Login failed.');
            }
        });
    } else {
        console.error('Login form not found on this page.');
    }
});

// login.html (signup) js
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const userData = {
            username: formData.get('username'),
            password: formData.get('password'),
        };
        try {
            const res = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const result = await res.json();
            console.log('Signup result:', result);
            alert(result.message || 'Signup successful. Please log in.');
            signupForm.reset();
        } catch (err) {
            console.error('Signup error:', err);
            alert('Signup failed. Please try again.');
        }
    });
});