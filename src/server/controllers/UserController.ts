import { supabase } from '../db';
import { Request, Response } from 'express';
import Send from '../auth/Send';

class UserController {
    static getUser = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;

            const { data: user, error } = await supabase.from('users').select('username').eq('id', userId).single();

            if (error) {
                return Send.error(res, null);
            }

            if (!user) {
                return Send.notFound(res, null, 'User not found');
            }

            return Send.success(res, user, 'User found');
        } catch (error) {
            console.error('Error fetching user info:', error);
            return Send.error(res, null, 'Internal server error');
        }
    };
}

export default UserController;
