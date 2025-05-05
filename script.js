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
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await authService.login(email, password);
                showApp();
                await loadTasks();
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
        logoutBtn.addEventListener('click', async function() {
            console.log("logout")
            await authService.logout();
            tasks = [];
            showAuth();
        });
    }


    async function loadTasks() {
        if (!authService.isAuthenticated()) return;

        const user = authService.currentUser;
        const creatorId = user.userId;
        const page = 0;
        const size = 10;

        try {
            const response = await fetch(`http://localhost:8080/tasks/all/creator/${creatorId}?page=${page}&size=${size}`, {
                headers: {
                    'Authorization': `Bearer ${authService.currentUser?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                tasks = data.content; // `Page<TaskDto>` contains `content`, `totalPages`, etc.
                renderTasks();
            } else {
                console.error("Failed to load tasks", response.status);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }


    function saveTasks() {
        if (authService.isAuthenticated()) {
            authService.currentUser.tasks = tasks;
            authService.setCurrentUser(authService.currentUser);
            loadTasks().then(r =>
                renderTasks()
            )
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentTab === 'all') return true;
            if (currentTab === 'active') return task.status !== 'completed';
            if (currentTab === 'completed') return task.status === 'completed';
            return true;
        });

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;

            const taskHeader = document.createElement('div');
            taskHeader.className = 'task-header';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.status === 'completed';
            checkbox.addEventListener('change', (e) => {
                toggleTaskComplete(task.id, e.target.checked).catch(() => {
                    e.target.checked = !e.target.checked; // Revert if failed
                });
            });

            const titleSpan = document.createElement('span');
            titleSpan.className = `task-title ${task.status === 'completed' ? 'completed' : ''}`;
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
            statusSpan.textContent = task.status === 'completed' ? 'Completed' : 'Pending';

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

    async function addTask() {
        const title = taskTitle.value.trim();
        const description = taskDescription.value.trim();
        const dueDate = taskDueDate.value;
        const priority = taskPriority.value.toLowerCase(); // expected: high/mid/low
        const status = "pending"; // You can also make this dynamic via dropdown
        const creatorId = authService?.currentUser?.id;
        const executorId = creatorId; // Or use another dropdown if needed

        if (!title) {
            alert("Please enter a task title");
            return;
        }

        if (!authService.isAuthenticated()) {
            alert("You must be logged in");
            return;
        }

        const accessToken = authService.currentUser?.accessToken;

        const taskData = {
            title,
            description,
            priority,
            status,
            dueDate,
            creator: { id: creatorId },
            executor: { id: executorId }
        };

        try {
            const response = await fetch("http://localhost:8080/tasks/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + accessToken
                },
                body: JSON.stringify(taskData)
            });

            if (response.status === 201) {
                const createdTask = await response.json();
                tasks.unshift(createdTask); // Store locally if needed
                saveTasks();
                alert("Task created and saved in database!");
            } else if (response.status === 403) {
                alert("Only admins can create tasks.");
            } else {
                const errorData = await response.json();
                alert("Error: " + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("Failed to save task:", error);
            alert("Network error occurred");
        }

        // Clear fields
        taskTitle.value = '';
        taskDescription.value = '';
        taskDueDate.value = '';
        taskPriority.value = 'medium';
    }

    async function toggleTaskComplete(taskId, isChecked) {
        const status = isChecked ? "completed" : "pending";
        try {
            const response = await fetch(`http://localhost:8080/tasks/${taskId}/status`, {
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${authService.currentUser?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: status
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update status: ${errorData.message || response.status}`);
            }

            const updatedTask = await response.json();

            // Update local state
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = updatedTask; // Replace entire task with updated version
            }

            // Re-render the tasks to reflect changes
            renderTasks();

            return updatedTask;
        } catch (err) {
            console.error("Error updating task status:", err.message);
            throw err;
        }
    }

    async function deleteTask(taskId) {
        if (!authService.isAuthenticated()) {
            console.error("User not authenticated");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/tasks/${taskId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${authService.currentUser?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log("Successfully deleted task from backend");
                // Update local state
                tasks = tasks.filter(t => t.id !== taskId);
                renderTasks();
            } else {
                console.error("Failed to delete task", await response.json());
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }

    function updateTaskCount(count) {
        const activeTasks = tasks.filter(task => task.status !== 'completed').length;
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