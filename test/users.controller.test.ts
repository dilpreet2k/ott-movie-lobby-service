// test/controllers/users.controller.test.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { createNewUser, login } from '../src/controllers/users';
import { UserHelper } from '../src/helpers/userHelper';

jest.mock('bcrypt');
jest.mock('../src/helpers/userHelper');

describe('User controller - createNewUser', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: {}
        } as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as any;
        next = jest.fn();
    });

    it('should create a new user successfully', async () => {
        const userParams = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'hashPassword',
            isAdmin: false
        };

        const savedUser = {
            id: '12345',
            name: 'John Doe',
            email: 'john.doe@example.com',
            isAdmin: false
        };

        req.body = userParams;

        (UserHelper.sanitizeCreateUserParams as jest.Mock).mockResolvedValue(userParams);

        // Mock bcrypt hash to return 'hashedpassword' when called
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

        (UserHelper.createNewUser as jest.Mock).mockResolvedValue(savedUser);

        await createNewUser(req, res, next);

        expect(UserHelper.sanitizeCreateUserParams).toHaveBeenCalledWith(req.body);

        expect(UserHelper.createNewUser).toHaveBeenCalledWith({
            ...userParams,
            password: 'hashedpassword'
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            isAdmin: savedUser.isAdmin
        });
    });

    it('should handle errors', async () => {
        const error = new Error('Test error');

        (UserHelper.sanitizeCreateUserParams as jest.Mock).mockRejectedValue(error);

        await createNewUser(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});

describe('User controller - login', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: {}
        } as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as any;
        next = jest.fn();
    });

    it('should login a user successfully', async () => {
        const loginParams = {
            email: 'john.doe@example.com',
            password: 'securepassword'
        };

        const sanitizedUser = {
            id: '12345',
            email: 'john.doe@example.com',
            password: 'hashedpassword'
        };

        const token = 'jwt-token';

        req.body = loginParams;

        (UserHelper.sanitizeLoginParams as jest.Mock).mockResolvedValue(sanitizedUser);
        (UserHelper.generateTokenForUser as jest.Mock).mockReturnValue(token);

        await login(req, res, next);

        expect(UserHelper.sanitizeLoginParams).toHaveBeenCalledWith(req.body);
        expect(UserHelper.generateTokenForUser).toHaveBeenCalledWith(sanitizedUser);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token });
    });

    it('should handle login errors', async () => {
        const error = new Error('Login error');

        (UserHelper.sanitizeLoginParams as jest.Mock).mockRejectedValue(error);

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
