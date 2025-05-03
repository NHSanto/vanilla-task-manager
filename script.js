// script.js - Complete Task Manager with Auth Integration

document.addEventListener('DOMContentLoaded', function() {
    // ====================== DOM Elements ======================
    // Auth elements
    const authScreens = document.getElementById('auth-screens');
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    // App elements
    const appContainer = document.getElementById('app-container');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUserEmail = document.getElementById('current-user-email');

    // Task manager elements
    const taskTitle = document.getElementById('taskTitle');
    const taskDescription = document.getElementById('taskDescription');
    const taskDueDate = document.getElementById('taskDueDate');
    const taskPriority = document.getElementById('taskPriority');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const tabs = document.querySelectorAll('.tab');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    // App state
    let tasks = [];
    let currentTab = 'all';
    let currentPage = 1;
    const tasksPerPage = 5;

    // Initialize
    initApp();

    // ====================== Auth Functions ======================
    function initApp() {
        if (authService.isAuthenticated()) {
            showApp();
            loadTasks();
        } else {
            showAuth();
        }
        setupAuthEventListeners();
    }

    function showApp() {
        currentUserEmail.textContent = authService.currentUser.email;
        authScreens.style.display = 'none';
        appContainer.style.display = 'block';
    }

    function showAuth() {
        appContainer.style.display = 'none';
        authScreens.style.display = 'flex';
        loginScreen.style.display = 'block';
        registerScreen.style.display = 'none';

        // Reset forms
        loginForm.reset();
        registerForm.reset();
    }

    function setupAuthEventListeners() {
        // Toggle between login/register
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginScreen.style.display = 'none';
            registerScreen.style.display = 'block';
        });

        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerScreen.style.display = 'none';
            loginScreen.style.display = 'block';
        });

        // Login form submission
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                authService.login(email, password);
                showApp();
                loadTasks();
                loginForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });

        // Register form submission
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            try {
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                authService.register(name, email, password);
                showApp();
                loadTasks();
                registerForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });

        // Logout button
        logoutBtn.addEventListener('click', function() {
            authService.logout();
            tasks = [];
            showAuth();
        });
    }


    function loadTasks() {
        if (authService.isAuthenticated()) {
            tasks = authService.currentUser.tasks || [];
            renderTasks();
        }
    }

    function saveTasks() {
        if (authService.isAuthenticated()) {
            authService.currentUser.tasks = tasks;
            authService.setCurrentUser(authService.currentUser);
            renderTasks();
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentTab === 'all') return true;
            if (currentTab === 'active') return !task.completed;
            if (currentTab === 'completed') return task.completed;
            return true;
        });

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;

            const taskHeader = document.createElement('div');
            taskHeader.className = 'task-header';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));

            const titleSpan = document.createElement('span');
            titleSpan.className = `task-title ${task.completed ? 'completed' : ''}`;
            titleSpan.textContent = task.title;

            const prioritySpan = document.createElement('span');
            prioritySpan.className = `task-priority priority-${task.priority}`;
            prioritySpan.textContent = task.priority;

            taskHeader.appendChild(checkbox);
            taskHeader.appendChild(titleSpan);
            taskHeader.appendChild(prioritySpan);

            if (task.dueDate) {
                const dueDateSpan = document.createElement('span');
                dueDateSpan.className = 'task-due-date';
                dueDateSpan.textContent = formatDate(task.dueDate);
                taskHeader.appendChild(dueDateSpan);
            }

            let descriptionElem = null;
            if (task.description) {
                descriptionElem = document.createElement('div');
                descriptionElem.className = 'task-description';
                descriptionElem.textContent = task.description;
            }

            const taskFooter = document.createElement('div');
            taskFooter.className = 'task-footer';

            const statusSpan = document.createElement('span');
            statusSpan.className = 'task-status';
            statusSpan.textContent = task.completed ? 'Completed' : 'Pending';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            taskFooter.appendChild(statusSpan);
            taskFooter.appendChild(deleteBtn);

            taskItem.appendChild(taskHeader);
            if (descriptionElem) taskItem.appendChild(descriptionElem);
            taskItem.appendChild(taskFooter);

            taskList.appendChild(taskItem);
        });

        updateTaskCount(filteredTasks.length);
    }

    function addTask() {
        const title = taskTitle.value.trim();
        if (!title) {
            alert('Please enter a task title');
            return;
        }

        const newTask = {
            id: Date.now(),
            title: title,
            description: taskDescription.value.trim(),
            dueDate: taskDueDate.value || null,
            priority: taskPriority.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveTasks();

        taskTitle.value = '';
        taskDescription.value = '';
        taskDueDate.value = '';
        taskPriority.value = 'medium';
    }

    function toggleTaskComplete(taskId) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
        }
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
    }

    function updateTaskCount(count) {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${count} ${count === 1 ? 'task' : 'tasks'} (${activeTasks} active)`;
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Event listeners
    addButton.addEventListener('click', addTask);

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            renderTasks();
        });
    });

});