// Todo List Application

// Import the built-in File System module.
// We use "fs" to read and write the todos.json file.
const fs = require("fs");

// Store the path/name of our JSON file in a variable.
const filePath = "./todos.json";


// --------------------------------------------------
// FUNCTION: addTask()
// Purpose: Add a new task to the todo list
// --------------------------------------------------

const addTask = (task) => {

    // Create an empty array to store tasks.
    let tasks = [];

    // Check whether the todos.json file already exists.
    if (fs.existsSync(filePath)) {

        // Read the contents of todos.json.
        // "utf8" converts the file data into a normal string.
        const data = fs.readFileSync(filePath, "utf8");

        // Check whether the file contains any data.
        if (data) {

            // Convert JSON string into a JavaScript array.
            tasks = JSON.parse(data);
        }
    }

    // Add the new task to the tasks array.
    tasks.push(task);

    // Convert the JavaScript array into JSON format
    // and save it inside todos.json.
    //
    // null and 2 are used to format the JSON nicely.
    fs.writeFileSync(
        filePath,
        JSON.stringify(tasks, null, 2)
    );

    // Display a success message.
    console.log(`Task added: "${task}"`);
};


// --------------------------------------------------
// FUNCTION: listTasks()
// Purpose: Display all tasks
// --------------------------------------------------

const listTasks = () => {

    // Check whether the todos.json file exists.
    if (!fs.existsSync(filePath)) {

        // If the file doesn't exist, there are no tasks.
        console.log("No tasks found.");

        // Stop executing this function.
        return;
    }

    // Read the contents of todos.json.
    const data = fs.readFileSync(filePath, "utf8");

    // Check whether the file is empty.
    if (!data) {

        // Display a message if there are no tasks.
        console.log("No tasks found.");

        // Stop executing this function.
        return;
    }

    // Convert JSON data into a JavaScript array.
    const tasks = JSON.parse(data);

    // Check whether the tasks array is empty.
    if (tasks.length === 0) {

        // Display a message if there are no tasks.
        console.log("No tasks found.");

        // Stop executing this function.
        return;
    }

    // Print the heading.
    console.log("\nTodo List:");

    // Loop through every task in the array.
    tasks.forEach((task, index) => {

        // Display the task number and task name.
        //
        // index starts from 0, so we add 1 to display
        // task numbers starting from 1.
        console.log(`${index + 1}. ${task}`);
    });
};


// --------------------------------------------------
// FUNCTION: removeTask()
// Purpose: Remove a task from the todo list
// --------------------------------------------------

const removeTask = (taskNumber) => {

    // Check whether the todos.json file exists.
    if (!fs.existsSync(filePath)) {

        // If the file doesn't exist, there are no tasks.
        console.log("No tasks found.");

        // Stop executing this function.
        return;
    }

    // Read the contents of todos.json.
    const data = fs.readFileSync(filePath, "utf8");

    // Convert JSON data into a JavaScript array.
    //
    // If the file is empty, use an empty array instead.
    let tasks = data ? JSON.parse(data) : [];

    // Convert the task number from string to integer.
    //
    // User enters 1 for the first task,
    // but array index starts from 0.
    //
    // Therefore, subtract 1.
    const index = parseInt(taskNumber) - 1;

    // Check whether the entered task number is invalid.
    if (index < 0 || index >= tasks.length) {

        // Display an error message.
        console.log("Invalid task number.");

        // Stop executing the function.
        return;
    }

    // Remove one task from the array.
    //
    // splice(index, 1)
    // means start at "index" and remove 1 item.
    //
    // splice() returns an array containing the removed item.
    const removedTask = tasks.splice(index, 1);

    // Save the updated tasks array back to todos.json.
    fs.writeFileSync(
        filePath,
        JSON.stringify(tasks, null, 2)
    );

    // Display which task was removed.
    console.log(`Task removed: "${removedTask[0]}"`);
};


// --------------------------------------------------
// COMMAND-LINE ARGUMENTS
// --------------------------------------------------

// process.argv contains all command-line arguments.
//
// Example:
//
// node todo.js add "Learn Node.js"
//
// process.argv will contain something similar to:
//
// [
//     "node",
//     "todo.js",
//     "add",
//     "Learn Node.js"
// ]

// Remove the first two default values ("node" and filename).
const args = process.argv.slice(2);


// --------------------------------------------------
// GET THE COMMAND
// --------------------------------------------------

// Get the first argument.
//
// Example:
//
// node todo.js add "Learn Node.js"
//
// args = ["add", "Learn Node.js"]
//
// command = "add"
const command = args[0];


// --------------------------------------------------
// GET THE ARGUMENT
// --------------------------------------------------

// Get everything after the command.
//
// Example:
//
// args = ["add", "Learn Node.js"]
//
// args.slice(1) = ["Learn Node.js"]
//
// join(" ") converts it into:
//
// "Learn Node.js"
const argument = args.slice(1).join(" ");


// --------------------------------------------------
// COMMAND HANDLING
// --------------------------------------------------

// Check whether the user entered the "add" command
// and provided a task.
if (command === "add" && args.length > 1) {

    // Call the addTask() function
    // and pass the task as an argument.
    addTask(argument);


// Check whether the user entered the "list" command.
} else if (command === "list") {

    // Call the listTasks() function.
    listTasks();


// Check whether the user entered the "remove" command
// and provided a task number.
} else if (command === "remove" && args.length > 1) {

    // Call removeTask() and pass the task number.
    removeTask(argument);


// If none of the above conditions are true.
} else {

    // Display the correct commands to the user.
    console.log(
        "Invalid command. Please use 'add', 'list', or 'remove'."
    );
}