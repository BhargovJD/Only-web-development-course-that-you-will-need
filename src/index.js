// Import the dotenv package so we can read variables from the .env file.
import dotenv from "dotenv";

// Load the environment variables from the .env file.
dotenv.config({
    // Specify the path of the environment variable file.
    path: ".env",
});

// Import Express (the web framework) using ES module syntax.
import express from "express";

// Create the Express application. "app" is what we use to define routes and start the server.
const app = express();

// Use the PORT value from the .env file if it exists, otherwise fall back to 3000.
// process.env holds all environment variables, including the ones dotenv loaded.
const PORT = process.env.PORT || 3000;

// Routes
// GET is for retrieving data
// POST is for sending data to the server

// Define a GET route for the home page ("/").
// The function runs every time someone visits http://localhost:3000/
app.get("/", (req, res) => {
    // req: the request coming from the client (URL, headers, body, etc.)
    // res: the response that we send back to the client

    // Send plain text back to the browser.
    res.send("Hello from Express with ES modules!");
});

// Start the server and make it listen for incoming requests on the chosen port.
app.listen(PORT, () => {
    // This callback runs once the server has started successfully.
    console.log(`Server running at http://localhost:${PORT}`);
});
