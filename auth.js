// Current user from localStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Get all users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Set current user
async function setCurrentUser(user) {
    currentUser = user;
    await localStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear current user (logout)
function clearCurrentUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Register new user
function register(name, email, password) {
    const users = getUsers();

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        throw new Error('Email already registered');
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // Note: In production, hash this password
        tasks: []
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    return newUser;
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

// Login
async function login(email, password) {
    const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error('Invalid email or password');
    }
    const data = await response.json();
    const payload = parseJwt(data.accessToken);

    const user = {
        email,
        name: payload.fullName,
        userId: payload.userId,
        role: payload.role,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tasks: [] // Initialize tasks
    };
    await setCurrentUser(user);
    return user;
}

// Logout user
async function logout() {
    const user = currentUser;
console.log(user)
    if (!user || !user.refreshToken) {
        clearCurrentUser();
        return;
    }

    try {
        await fetch('http://localhost:8080/auth/logout', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + user.accessToken
            },
            body: JSON.stringify({ refreshJwtRequest: user.refreshToken })
        });
    } catch (err) {
        console.warn('Logout request failed:', err);
        // still proceed to clear session
    }

    clearCurrentUser();
}
// Public API
const authService = {
    get currentUser() { return currentUser; },
    getUsers,
    setCurrentUser,
    clearCurrentUser,
    isAuthenticated,
    register,
    login,
    logout
};

// Initialize by loading current user
(function init() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
})();

// Export the auth service
window.authService = authService;