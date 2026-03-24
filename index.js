 const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');

    taskInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter'){
        addBtn.click();
      }
    });

    addBtn.addEventListener('click', () => {
      const taskText = taskInput.value.trim();
      if(taskText === "") return;

      createTask(taskText, false);
      taskInput.value = '';
      saveTasks();
    });

    function createTask(text, completed){
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = completed;

      if(completed){
        li.classList.add('completed');
      }

      checkbox.addEventListener('change', () => {
        li.classList.toggle('completed');
        saveTasks();
      });

      const span = document.createElement('span');
      span.textContent = text;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '❌';
      removeBtn.classList.add('delete');

      removeBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(removeBtn);

      taskList.appendChild(li);
    }

    function saveTasks(){
      const tasks = [];
      document.querySelectorAll('#taskList li').forEach(li => {
        const text = li.querySelector('span').textContent;
        const completed = li.querySelector('input').checked;
        tasks.push({ text, completed });
      });
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks(){
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.forEach(task => {
        createTask(task.text, task.completed);
      });
    }

    loadTasks();