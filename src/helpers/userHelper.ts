import User, { IUser } from '../models/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * User Helper functions
 */
const UserHelper = {
    /**
     * Sanitize user creation parameters
     * @param params - Parameters from the request body
     * @returns - Sanitized parameters
     * @throws - Throws an error if parameters are invalid or user already exists
     */
    sanitizeCreateUserParams: async (params: IUser): Promise<any> => {
        const { name, email, password, isAdmin } = params;

        // Validate required fields
        if (!name || !email || !password || isAdmin === undefined) {
            throw new Error('INVALID_REQ_PARAMS');
        }

        // Check if the user already exists
        const doesExist = await User.findOne({ email });
        if (doesExist) {
            throw new Error('USER_ALREADY_EXIST');
        }

        return { name, email, isAdmin, password };
    },

    /**
     * Create a new user
     * @param params - Sanitized user parameters
     * @returns - Saved user document
     */
    createNewUser: async (params: IUser): Promise<IUser> => {
        const newUser = new User(params);
        return newUser.save();
    },

    /**
     * Sanitize login parameters
     * @param params - Parameters from the request body
     * @returns - User document if valid
     * @throws - Throws an error if parameters are invalid or user credentials are incorrect
     */
    sanitizeLoginParams: async (params: any): Promise<IUser> => {
        const { email, password } = params;

        // Validate required fields
        if (!email || !password) {
            throw new Error('INVALID_REQ_PARAMS');
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('INVALID_USER_EMAIL');
        }

        // Validate the user's password
        const isPasswordValid = bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('INVALID_USER_PASSWORD');
        }

        return user;
    },

    /**
     * Generate authentication token for user
     * @param user - User document
     * @returns - JWT token
     */
    generateTokenForUser: (user: IUser): string => {
        const jwtPayload = { userId: user._id, email: user.email, isAdmin: user.isAdmin };
        const options = { expiresIn: '12h' };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY || 'DEFAULT', options);

        return token;
    },
};

export { UserHelper };
