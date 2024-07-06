import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware.
 * @param error Caught error object.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Next function to handle errors.
 */
const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Default to unexpected error if error message isn't recognized
    if (!(error.message in errorMessages)) {
        error.message = 'ERR_UNEXPECTED_ERROR';
    }

    // Retrieve error response details from errorMessages object
    const errorRes = errorMessages[error.message];
    // Set appropriate status code and send JSON response
    res.status(errorRes.status_code).json({ code: errorRes.code, message: errorRes.message });
};

// Define error messages with corresponding status codes
const errorMessages: Record<string, { code: number; message: string; status_code: number }> = {
    ERR_UNEXPECTED_ERROR: { code: 1001, message: "Unexpected Error: Something went wrong!", status_code: 500 },
    CANNOT_CREATE_USER: { code: 1002, message: "Not able to create users right now!", status_code: 500 },
    USER_ALREADY_EXIST: { code: 1003, message: "User with given email already exists!", status_code: 400 },
    INVALID_USER_EMAIL: { code: 1004, message: "User with this email doesn't exist!", status_code: 404 },
    INVALID_USER_PASSWORD: { code: 1005, message: "User password is incorrect!", status_code: 400 },
    INVALID_REQ_PARAMS: { code: 1006, message: "Invalid Request Params!", status_code: 400 },
    NO_AUTH_TOKEN: { code: 1007, message: "No auth token provided!", status_code: 401 },
    INVALID_AUTH_TOKEN: { code: 1008, message: "Invalid auth token provided!", status_code: 403 },
    ONLY_ADMIN_ALLOWED: { code: 1009, message: "Only Admins are allowed to access, not allowed to this account!", status_code: 403 },
    NO_SEARCH_QUERY_FOUND: { code: 1010, message: "No search query found!", status_code: 400 },
    MOVIE_NOT_FOUND: { code: 1011, message: "Movie not found, can't update!", status_code: 404 },
    MOVIE_ID_MISSING: { code: 1012, message: "Movie ID is missing in request params!", status_code: 400 },
    MOVIE_ID_INVALID: { code: 1013, message: "Movie ID is invalid!", status_code: 400 },
};

export {
    errorHandler
};
