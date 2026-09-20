// Import the dotenv package so we can read variables from the .env file.
import dotenv from "dotenv";

// Load the environment variables from the .env file.
dotenv.config({
    // Specify the path of the environment variable file.
    path: ".env",
});

// Get the value of "username" from the environment variables
// and store it in the username variable.
// process is a built-in global object provided by Node.js.
// It gives your program information and access to things related to the environment in which the
// Node.js application is running.
const username = process.env.app_username;

// Print the username to the console.
console.log(username);

// Print a greeting using the username.
console.log("Hello, " + username + "!");
