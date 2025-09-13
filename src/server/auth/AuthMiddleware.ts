import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Send from './Send';

class AuthMiddleware {
    static authenticateUser = (req: Request, res: Response, next: NextFunction) => {
        // Extract token from HttpOnly cookie
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return Send.unauthorized(res, null);
        }

        try {
            // Verify the token using the secret
            const decodedToken = jwt.verify(accessToken, process.env.JWT_KEY!);

            // Attach user information to the request object
            (req as any).user = decodedToken;
            next();
        }
        catch (error) {
            console.error('Authentication failed:', error);
            return Send.unauthorized(res, null);
        }
    }

    static refreshTokenValidation = (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return Send.unauthorized(res, null, 'No refresh token provided');
        }

        try {
            // Verify the refresh token using the secret
            const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_KEY!) as { userId: number };

            // Attach user information to the request object
            (req as any).userId = decodedToken.userId;
            next();
        }
        catch (error) {
            console.error('Authentication failed:', error);
            return Send.unauthorized(res, null, 'Invalid or expired refresh token');
        }
    }
}

export default AuthMiddleware;
