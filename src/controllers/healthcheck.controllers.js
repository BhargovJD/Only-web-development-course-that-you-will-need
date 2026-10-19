// This code is a health-check API.
// It is usually used to check whether your backend/server is running properly.

import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// Define an asynchronous healthCheck controller function.
// asyncHandler is used to handle errors from the async function.
const healthCheck = asyncHandler(async (req, res) => {
    // Send an HTTP 200 (OK) response to the client.
    // json() sends the response in JSON format.
    // ApiResponse creates a standard/custom response structure.
    res.status(200).json(
        // 200 = HTTP status code
        // "Server is running..." = response message
        new ApiResponse(200, "Server is running..."),
    );
});

export { healthCheck };
