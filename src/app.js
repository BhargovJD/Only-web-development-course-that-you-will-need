import express from "express";
import cors from "cors";

const app = express();

// Register CORS as middleware. It runs on every request before your routes.
// CORS controls which websites (origins) are allowed to call your API from a browser.
app.use(
    cors({
        // Which origins may access the API.
        // If CORS_ORIGIN exists in .env (e.g. "http://localhost:5173,https://myapp.com"),
        // split it by commas into an array of allowed origins.
        // Otherwise fall back to "*", which allows every origin.
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",")
            : "*",

        // Allow the browser to send cookies and auth credentials with requests.
        credentials: true,

        // HTTP methods that cross-origin requests are allowed to use.
        // OPTIONS is the "preflight" request browsers send before the real request.
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

        // Request headers the client is allowed to send.
        // Content-Type is needed for JSON bodies, Authorization for tokens (e.g. Bearer).
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// Parse incoming JSON bodies (Content-Type: application/json)
// and put the result on req.body. Bodies larger than 16kb are rejected,
// which protects the server from huge payloads.
app.use(express.json({ limit: "16kb" }));

// Parse form submissions (Content-Type: application/x-www-form-urlencoded)
// and put the result on req.body.
// extended: true allows nested objects in the form data (uses the "qs" library).
// Same 16kb size limit as above.
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files (images, CSS, HTML, etc.) from the "public" folder.
// For example, public/logo.png is available at http://localhost:3000/logo.png
app.use(express.static("public"));

import healthcheckRouter from "./routes/healthcheck.routes.js";
app.use("/api/v1/healthcheck", healthcheckRouter);

app.get("/", (req, res) => {
    res.send("Hello from Express with ES modules!");
});

export default app;
