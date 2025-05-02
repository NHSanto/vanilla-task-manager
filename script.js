document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
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
    loadTasks();

    // Load tasks from API/localStorage
    function loadTasks() {

        // For demo purposes, use localStorage
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
    }

    // Save tasks to API/localStorage
    function saveTasks() {
        // For demo purposes, use localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
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

        taskTitle.value = '';
        taskDescription.value = '';
        taskDueDate.value = '';
        taskPriority.value = 'medium';

        saveTasks();
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