// Create a class named ApiResponse to create a standard API response object
class ApiResponse {
    // Constructor runs automatically whenever we create a new ApiResponse object
    // statusCode = HTTP status code (e.g., 200, 201, 400, 500)
    // message = response message; default value is "Success"
    // data = actual data we want to send to the client
    constructor(statusCode, message = "Success", data) {
        // Store the status code inside the object
        this.statusCode = statusCode;

        // Store the response message inside the object
        this.message = message;

        // Store the actual response data inside the object
        this.data = data;

        // Check whether the status code is less than 400
        // If statusCode is 200, 201, 300, etc. → success = true
        // If statusCode is 400, 401, 404, 500, etc. → success = false
        this.success = statusCode < 400;
    }
}

// Export the ApiResponse class so it can be imported and used in other files
export { ApiResponse };
