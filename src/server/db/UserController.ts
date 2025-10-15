import { supabase } from './db';
import { Request, Response } from 'express';
import Send from '../auth/Send';
import { Player } from '@/types/player';

/*
Credit: gigi shalamberidze
*/

class UserController {
    static getUser = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;

            const { data: user, error } = await supabase
                .from('users')
                .select('user_id, username')
                .eq('user_id', userId)
                .single();

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

    // static getUserMetrics = async (req: Request, res: Response) => {
    //     try {
    //         const userId = (req as any).userId;

    //         const { data: user, error } = await supabase
    //             .from('users')
    //             .select('user_id, username')
    //             .eq('user_id', userId)
    //             .single();

    //     } catch (error) {

    //     }
    // }

    static getUserSolves = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;

            const { data: solves, error } = await supabase
                .from('user_solves')
                .select('scramble, solve_duration, solved_at')
                .eq('user_id', userId)
                .order('solved_at', { ascending: true });

            if (error) {
                return Send.error(res, null);
            }

            if (!solves) {
                return Send.notFound(res, null, 'User solves not found');
            }

            return Send.success(res, solves, 'User solves found');
        } catch (error) {
            console.error('Error fetching solve info:', error);
            return Send.error(res, null, 'Internal server error');
        }
    };

    static saveSolve = async (player: Player, scramble: string, result: string) => {
        try {
            if (!player.loggedIn) return false;

            // Check if the player exists in the 'users' table
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .eq('user_id', player.userId)
                .single();

            if (userError || !user) {
                console.error(`Player not found with id: ${player.userId}`);
                return false;
            }

            // Insert the solve data into 'user_solves'
            const { error: insertError } = await supabase.from('user_solves').upsert({
                user_id: user.user_id,
                scramble: scramble,
                solve_duration: player.solveTime,
                move_history: player.moveHistory,
                result: result,
                solved_at: new Date(Date.now()).toISOString(),
            });

            if (insertError) {
                console.error(`Error inserting solve: ${insertError.message}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('An error occurred:', error);
            return false;
        }
    };
}

export default UserController;
