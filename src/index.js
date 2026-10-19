// Main entry point of the application. Light weight.
// Load environment variables before importing the app. Static imports run
// before this file's body, so app.js would otherwise read process.env too early.
import dotenv from "dotenv";

dotenv.config({
    path: ".env",
});

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./db/index.js");

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(`Error connecting to the database: ${error}`);
        process.exit(1); // Exit the process with failure
    });
