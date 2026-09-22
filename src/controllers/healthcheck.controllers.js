// This code is a health-check API.
// It is usually used to check whether your backend/server is running properly.

import { ApiResponse } from "../utils/api-response.js";

const healthCheck = (req, res) => {
    try {
        res.status(200).json(
            new ApiResponse(200, {
                message: "Health check successful",
            }),
        );
    } catch (error) {
        res.status(500).json(
            new ApiResponse(500, "Internal Server Error", {
                error: error.message,
            }),
        );
    }
};

export { healthCheck };
