import { Request, Response } from 'express';
import { supabase } from '../db.ts';
import Send from './Send.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/*
Handles the core auth operations:
- register
- login
- logout 
- refresh access token

Credit: gigi shalamberidze
*/

class AuthController {
    static register = async (req: Request, res: Response) => {
        const { username, email, password } = req.body;

        let { data: existingUser, error: searchError } = await supabase
            .from('users')
            .select('id, username, email')
            .or(`email.eq.${email},username.eq.${username}`);

        if (searchError) {
            return Send.error(res, null, 'Internal request error');
        }

        if (existingUser && existingUser.length > 0) {
            const conflictField =
                email === existingUser[0].email
                    ? 'Email is already associated with an account'
                    : `Username is already in use`;
            return Send.error(res, null, conflictField);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({ username: username, email: email, pwd: hashedPassword })
            .select('id, username')
            .single();

        if (insertError) {
            return Send.error(res, null, 'Registration failed');
        }

        const accessToken = jwt.sign(
            {
                userId: newUser.id,
                email: email,
            },
            process.env.JWT_KEY!,
            { expiresIn: process.env.JWT_EXPIRE as any }
        );
        const refreshToken = jwt.sign(
            {
                userId: newUser.id,
                email: email,
            },
            process.env.REFRESH_KEY!,
            { expiresIn: process.env.REFRESH_EXPIRE as any }
        );

        // Store refresh token in database
        await supabase.from('users').update({ refreshToken: refreshToken }).eq('id', newUser.id);

        // Set access and refresh tokens in HttpOnly cookies
        // Ensures tokens are unable to be accessed using JavaScript (security against XSS attacks)
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 60 * 1000, // 15 minutes in mileseconds
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in mileseconds
        });

        return Send.success(res, null, 'Registered successfully');
    };

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const { data: user, error } = await supabase.from('users').select('id, email, pwd').eq('email', email).single();

        if (error || !user) {
            return Send.error(res, null, 'Invalid email or password');
        }

        const isValid = await bcrypt.compare(password, user.pwd);

        if (!isValid) {
            return Send.error(res, null, 'Invalid email or password');
        }

        const accessToken = jwt.sign(
            {
                sub: user.id,
                email: user.email,
            },
            process.env.JWT_KEY!,
            { expiresIn: process.env.JWT_EXPIRE as any }
        );
        const refreshToken = jwt.sign(
            {
                sub: user.id,
                email: user.email,
            },
            process.env.REFRESH_KEY!,
            { expiresIn: process.env.REFRESH_EXPIRE as any }
        );

        // Store refresh token in database
        await supabase.from('users').update({ refreshToken: refreshToken }).eq('id', user.id);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return Send.success(res, null, 'Logged in successfully');
    };

    static refreshToken = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;
            const refreshToken = req.cookies.refreshToken;

            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, refreshToken')
                .eq('id', userId)
                .single();

            if (error || !user) {
                return Send.unauthorized(res, null, 'Invalid refresh token');
            }

            if (user.refreshToken !== refreshToken) {
                return Send.unauthorized(res, null, 'Invalid refresh token');
            }

            const newAccessToken = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                },
                process.env.JWT_KEY!,
                { expiresIn: process.env.JWT_EXPIRE as any }
            );
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                maxAge: 60 * 1000,
            });

            return Send.success(res, null, 'Access token refreshed successfully');
        } catch (error) {
            console.error('Refresh Token failed:', error);
            return Send.error(res, null, 'Failed to refresh token');
        }
    };
}

export default AuthController;
