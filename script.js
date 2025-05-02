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


});