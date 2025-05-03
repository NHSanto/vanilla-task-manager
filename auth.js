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
function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
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

// Login user
function login(email, password) {
    const user = getUsers().find(user =>
        user.email === email &&
        user.password === password
    );

    if (!user) {
        throw new Error('Invalid email or password');
    }

    setCurrentUser(user);
    return user;
}

// Logout user
function logout() {
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