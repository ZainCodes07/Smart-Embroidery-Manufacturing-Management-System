// Login Form Submission Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showNotification('Please enter username and password', 'error');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Authenticating...';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Login successful! Redirecting...', 'success');
                const userObj = data.user || { username, name: username, is_staff: username === 'admin', role: username === 'admin' ? 'admin' : 'operator' };
                setCurrentUser(userObj);
                localStorage.setItem('user', JSON.stringify(userObj));
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                showNotification(data.error || 'Invalid credentials', 'error');
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'Sign In to Factory OS';
            }
        } catch (error) {
            console.warn('Backend server offline, falling back to local session:', error);
            const userObj = { username, name: username === 'admin' ? 'Administrator' : username, is_staff: username === 'admin', role: username === 'admin' ? 'admin' : 'operator' };
            setCurrentUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            showNotification(`Signed in locally as ${userObj.name}`, 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 600);
        }
    });
});
