// Wait until the entire HTML document has been loaded before running the code
document.addEventListener('DOMContentLoaded', () => { 

    // Get the input element where the user enters a new todo
    const newTodoInput = document.getElementById('new-todo'); 

    // Get the button that will be used to add a new todo
    const addTodoButton = document.getElementById('add-todo'); 

    // Get the HTML element where the todo items will be displayed
    const todoList = document.getElementById('todo-list'); 
 
    // Check if there is already a "todos" item stored in localStorage
    // If it exists:
    //     - Get the stored value using localStorage.getItem('todos')
    //     - Convert the JSON string back into a JavaScript array using JSON.parse()
    //
    // If it does not exist:
    //     - Create an empty array []
    let todos = localStorage.getItem('todos') 
        ? JSON.parse(localStorage.getItem('todos')) 
        : []; 
 
    // Loop through all existing todos
    // For each todo, call the renderTodo() function
    todos.forEach((todo) => renderTodo(todo)); 
 
    // Add a click event listener to the Add Todo button
    // This function will run whenever the button is clicked
    addTodoButton.addEventListener('click', () => { 

        // Get the value entered in the input field
        // trim() removes extra spaces from the beginning and end
        const newTodoText = newTodoInput.value.trim(); 
 
        // Check whether the input is empty
        // If it is empty, stop the function using return
        if (newTodoText === '') { 
            return; 
        } 
 
        // Create a new todo object
        const newTodo = { 

            // Create a unique ID using the current timestamp
            id: Date.now(), 

            // Store the text entered by the user
            text: newTodoText, 

            // Set the initial completed status to false
            // This means the todo is not completed yet
            completed: false 
        }; 
 
        // Add the newly created todo object to the todos array
        todos.push(newTodo); 

        // Save the updated todos array into localStorage
        saveTodos(); 
 
        // Clear the input field after adding the todo
        newTodoInput.value = ''; 

        // Display the current todos array in the browser console
        console.log(todos); 
    }); 
 
    // This function is responsible for displaying a todo
    // on the webpage
    function renderTodo(todo) { 

        // Print the todo object in the browser console
        // Currently, this function does not add anything to the HTML
        console.log(todo); 
    } 
 
    // This function saves the todos array into localStorage
    function saveTodos() { 

        // localStorage can only store strings
        // Therefore, JSON.stringify() converts the todos array
        // into a JSON string before storing it
        localStorage.setItem('todos', JSON.stringify(todos)); 
    } 

// Close the DOMContentLoaded event listener
});