// Main entry point of the application. Light weight.
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path: ".env",
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
