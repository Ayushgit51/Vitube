const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
}



export {asyncHandler}


// This function takes an async function as an argument and returns a new function that handles errors.
// It uses a promise to catch any errors that occur during the execution of the async function.
// The returned function takes the request, response, and next middleware function as arguments.
// If an error occurs, it calls the next middleware function with the error as an argument.
// This is useful for handling errors in Express routes without having to use try-catch blocks in every route handler.
// This is a utility function to handle asynchronous route handlers in Express.
// It allows you to write cleaner code by avoiding repetitive try-catch blocks in your route handlers.
// This function is used to handle errors in asynchronous route handlers in Express.

// const asyncHandler = (fn) => {(req, res, next) => {}}
/*
    const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
}
*/