const newTodoInput = document.getElementById('new-todo');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');


let todos = [];

addTodoButton.addEventListener('click', () => {
    const newTodoText = newTodoInput.value.trim();
    if (newTodoText == '') {
        return;
    }
    const newTodo = {
        id: Date.now(),
        text: newTodoText,
        completed: false
    };

    todos.push(newTodo);
    saveTodos();
    newTodoInput.value = '';
    console.log(todos);
});



function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

