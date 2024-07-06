import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { UserHelper } from '../helpers/userHelper';

/**
 * 
 * @author Dilpreet Singh
 * @api {post} /movie_lobby/users Create a new user
 * @apiName CreateNewUser
 * @apiGroup User
 *
 * @apiParam {String} name User's name. (Required)
 * @apiParam {String} email User's email. (Required)
 * @apiParam {String} password User's password. (Required)
 * @apiParam {Boolean} isAdmin Is user an admin. (Required)
 *
 * @apiSuccess {String} id User's unique ID.
 * @apiSuccess {String} name User's name.
 * @apiSuccess {String} email User's email.
 * @apiSuccess {Boolean} isAdmin Is user an admin.
 *
 * @apiParamExample {json} Request-Example:
 * {
 *   "name": "Dilpreet",
 *   "email": "dilpreet@test.com",
 *   "isAdmin": false,
 *   "password": "12345678"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "id": "6689283466c01b9afab203a0",
 *   "name": "Dilpreet",
 *   "email": "dilpreet@test.com",
 *   "isAdmin": false
 * }
 *
 * @apiError {Number} code Error code.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 1001,
 *   "message": "Unexpected Error: Something went wrong!",
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 1003,
 *   "message": "User with given email already exists!",
 * }
 */
const createNewUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Sanitize and validate request parameters
        const params = await UserHelper.sanitizeCreateUserParams(req.body);

        // Hash the user's password before saving
        params.password = await bcrypt.hash(params.password, 10);

        // Create a new user in the database
        const savedUser = await UserHelper.createNewUser(params);

        // Create a response object to send back to the client
        const response = {
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            isAdmin: savedUser.isAdmin,
        };

        // Send a successful response with status code 201 (Created)
        res.status(201).json(response);
    } catch (error) {
        // Log and forward any errors to the error handling middleware
        console.log(error);
        next(error);
    }
};

/**
 * 
 * @author Dilpreet Singh
 * @api {post} /movie_lobby/login User login
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} email User's email. (Required)
 * @apiParam {String} password User's password. (Required)
 *
 * @apiSuccess {String} token Authentication token.
 *
 * @apiParamExample {json} Request-Example:
 * {
 *   "email": "preet@test.com",
 *   "password": "12345678"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Njg5MjgzNDY2YzAxYjlhZmFiMjAzYTAiLCJlbWFpbCI6InByZWV0QHRlc3QuY29tIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTcyMDI2NDc2OCwiZXhwIjoxNzIwMzA3OTY4fQ.NQ-Iy2pLdg8z_VRlinUZMvfm6DHWaeCBjCh60-4tVNQ"
 * }
 *
 * @apiError {Number} code Error code.
 * @apiError {String} message Error message.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "code": 1004,
 *   "message": "User with this email doesn't exist!"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 1005,
 *   "message": "User password is incorrect!",
 * }
 */
const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Sanitize and validate login parameters
        const user = await UserHelper.sanitizeLoginParams(req.body);

        // Generate a JWT token for the authenticated user
        const token = UserHelper.generateTokenForUser(user);

        // Send a successful response with status code 200 (OK)
        res.status(200).json({ token });
    } catch (error) {
        // Log and forward any errors to the error handling middleware
        console.log(error);
        next(error);
    }
};

export { createNewUser, login };
