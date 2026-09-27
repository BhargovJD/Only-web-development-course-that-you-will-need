// asyncHandler is a higher-order function.
// It takes an async request handler/controller as an argument.
const asyncHandler = (requestHandler) => {
    // Return a new middleware function.
    // Express will call this function with req, res, and next.
    return (req, res, next) => {
        // Execute the original requestHandler.
        // Promise.resolve() converts the returned value into a Promise.
        Promise.resolve(requestHandler(req, res, next))

            // If the Promise is rejected (an error occurs),
            // catch the error and pass it to Express using next().
            .catch((err) => {
                next(err);
            });
    };
};

// Export asyncHandler so it can be used in other files.
export { asyncHandler };
