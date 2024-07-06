declare global {
    namespace Express {
        interface Request {
            user?: { userId: string; email: string, isAdmin: boolean };
        }
    }
}

import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';

const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const url = req.originalUrl.split('?')[0];
    if (publicUrls.includes(url)) {
        return next();
    }

    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        throw new Error('NO_AUTH_TOKEN');
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || 'DEFAULT',
        (err: VerifyErrors | null, decoded: object | string | undefined) => {
            if (err || typeof decoded !== 'object') {
                throw new Error('INVALID_AUTH_TOKEN');
            }

            req.user = {
                userId: (decoded as JwtPayload).userId,
                email: (decoded as JwtPayload).email,
                isAdmin: (decoded as JwtPayload).isAdmin,
            };

            next();
        }
    )
};

const publicUrls: String[] = ['/movie_lobby/users', '/movie_lobby/users/login'];

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.isAdmin) {
        throw new Error('ONLY_ADMIN_ALLOWED');
    }

    next();
};
export {
    authenticateToken,
    isAdmin
}
