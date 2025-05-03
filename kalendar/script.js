document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ru',
        firstDay: 1,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: tasks.map(task => ({
            id: task.id,
            title: task.title,
            start: task.date,
            color: task.priority === 'высокий' ? 'red' : task.priority === 'средний' ? 'orange' : 'green',
            extendedProps: {
                description: task.description,
                completed: task.completed
            }
        })),
        eventClick: function (info) {
            const task = tasks.find(t => t.id === info.event.id);
            if (task) {
                const action = prompt(`Задача: ${task.title}\nОписание: ${task.description}\n\nВыберите действие:\n1. Редактировать\n2. Удалить\n3. Отметить как выполненную`, '1');
                
                if (action === '1') {
                    editTask(task.id);
                } else if (action === '2') {
                    if (confirm('Вы точно хотите удалить задачу?')) {
                        deleteTask(task.id);
                        info.event.remove();
                    }
                } else if (action === '3') {
                    toggleComplete(task.id);
                }
            }
        },
        dateClick: function (info) {
            const title = prompt('Введите название задачи:');
            if (title) {
                const description = prompt('Введите описание задачи:');
                const priority = prompt('Введите приоритет задачи (низкий, средний, высокий):');
                const date = info.dateStr;

                if (title.trim() !== '' && date.trim() !== '') {
                    const task = {
                        id: Date.now(),
                        title,
                        description,
                        priority,
                        completed: false,
                        date
                    };

                    tasks.push(task);
                    saveTasks();
                    renderTasks();
                    calendar.addEvent({
                        id: task.id,
                        title: task.title,
                        start: task.date,
                        color: task.priority === 'высокий' ? 'red' : task.priority === 'средний' ? 'orange' : 'green',
                        extendedProps: {
                            description: task.description,
                            completed: task.completed
                        }
                    });
                }
            }
        }
    });

    calendar.render();

    document.getElementById('add-task').addEventListener('click', function () {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const date = document.getElementById('task-date').value;
        const priority = document.getElementById('task-priority').value;

        if (title.trim() === '' || date.trim() === '') {
            alert('Введите название задачи и дату');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            description,
            priority,
            completed: false,
            date
        };

        tasks.push(task);
        saveTasks();
        renderTasks();
        calendar.addEvent({
            id: task.id,
            title: task.title,
            start: task.date,
            color: task.priority === 'высокий' ? 'red' : task.priority === 'средний' ? 'orange' : 'green',
            extendedProps: {
                description: task.description,
                completed: task.completed
            }
        });

        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-date').value = '';
    });

    function renderTasks() {
        const tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = '';

        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
            if (task.completed) taskItem.classList.add('completed');

            taskItem.innerHTML = `
                <div>
                    <span class="task-priority ${task.priority}"></span>
                    <strong>${task.title}</strong> - ${task.description}
                    <span class="task-date">(Срок: ${new Date(task.date).toLocaleDateString('ru-RU')})</span>
                </div>
                <div class="task-actions">
                    <button class="edit" onclick="editTask(${task.id})">✏️</button>
                    <button class="delete" onclick="confirmDelete(${task.id})">❌</button>
                    <button class="complete" onclick="toggleComplete(${task.id})">✔️</button>
                </div>
            `;

            tasksList.appendChild(taskItem);
        });
    }

    window.editTask = function (id) {
        const task = tasks.find(task => task.id === id);
        if (task) {
            const newTitle = prompt('Введите новое название задачи', task.title);
            const newDescription = prompt('Введите новое описание задачи', task.description);
            const newDate = prompt('Введите новую дату выполнения задачи (ГГГГ-ММ-ДД)', task.date);
            if (newTitle !== null && newDescription !== null && newDate !== null) {
                task.title = newTitle;
                task.description = newDescription;
                task.date = newDate;
                saveTasks();
                renderTasks();
                
                const event = calendar.getEventById(id);
                if (event) {
                    event.setProp('title', newTitle);
                    event.setStart(newDate);
                }
            }
        }
    };

    window.confirmDelete = function (id) {
        if (confirm('Вы точно хотите удалить задачу?')) {
            deleteTask(id);
        }
    };

    window.deleteTask = function (id) {
        const index = tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
            
            const event = calendar.getEventById(id);
            if (event) {
                event.remove();
            }
        }
    };

    window.toggleComplete = function (id) {
        const task = tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    };

    document.getElementById('sort-by-date').addEventListener('click', function () {
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        renderTasks();
    });

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    renderTasks();
});