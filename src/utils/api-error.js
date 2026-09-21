// Create a custom error class named ApiError
// "extends Error" means ApiError gets all the features of JavaScript's built-in Error class
class ApiError extends Error {
    // Constructor runs automatically when we create a new ApiError object
    // statusCode = HTTP error status code (400, 401, 404, 500, etc.)
    // message = description of the error
    // errors = additional error details; default is an empty array
    // stack = optional error stack trace; default is an empty string
    constructor(statusCode, message, errors = [], stack = "") {
        // Call the constructor of the parent Error class
        // This sets the standard Error message
        super(message);

        // Store the HTTP status code in the error object
        this.statusCode = statusCode;

        // Set data to null because an error response normally does not contain successful data
        this.data = null;

        // Store the error message
        this.message = message;

        // Store additional error details
        this.errors = errors;

        // An ApiError always represents a failed operation
        // Therefore, success is always false
        this.success = false;

        // Check whether a custom stack trace was provided
        if (stack) {
            // Use the provided custom stack trace
            this.stack = stack;
        } else {
            // Automatically create a stack trace
            // It helps us find where the error happened in the code
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the ApiError class so it can be imported and used in other files
export { ApiError };
