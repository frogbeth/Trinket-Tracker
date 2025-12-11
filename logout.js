//login option on the navbar gets changed 
// to "logout" and logs the user out when clicked
document.addEventListener('DOMContentLoaded', () => {
    const authLink = document.getElementById('auth-link');
    const userId = localStorage.getItem('userId');

    if (authLink) {
        if (userId) {
            authLink.textContent = 'Logout';
            authLink.href = '#';

            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userId');
                localStorage.removeItem('username');

                alert('You have been logged out.');
                window.location.href = 'login.html'
            });
        } else {
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
        }
    }
});