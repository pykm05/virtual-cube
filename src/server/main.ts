import express from 'express';
import cors from 'cors';
import http from 'http';
import './deps.ts';
import { supabase } from './db/db.ts';

import UserController from './db/UserController.ts';

import AuthController from './auth/AuthController.ts';
import AuthMiddleware from './auth/AuthMiddleware.ts';
import cookieParser from 'cookie-parser';
import Send from './auth/Send.ts';

const app = express();
const port = 4000;

const BASE_URL = "http://localhost:3000";

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
        : [])
    : ["http://localhost:3000", "http://backend:3000"];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (_, res) => {
    res.send('server running');
});

app.get('/api/leaderboard/:limit', AuthMiddleware.authenticateUser, async (req, res) => {
    const limit = parseInt(req.params.limit, 10);
    if (isNaN(limit)) {
        console.log(`Invalid limit (${req.params.limit}) NaN`);
        res.status(400).json({ error: 'Malformed request' });
    }

    let { data, error } = await supabase
        .from('leaderboard')
        .select()
        .order('solve_duration', { ascending: true })
        .limit(limit);

    if (error) {
        console.log(`Failed to fetch the leaderboard (lim ${limit}) due to: ${JSON.stringify(error)}`);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
        return;
    }
    // console.log(data);

    return Send.success(res, data, 'Registration failed');
});

app.post('/api/register', AuthController.register);
app.post('/api/login', AuthController.login);
app.post('/api/logout', AuthMiddleware.authenticateUser, AuthController.logout);
app.post('/api/refresh-token', AuthMiddleware.refreshTokenValidation, AuthController.refreshToken);

app.get('/api/get-user', AuthMiddleware.authenticateUser, UserController.getUser);
app.get('/api/get-user-solves', AuthMiddleware.authenticateUser, UserController.getUserSolves);

const server = http.createServer(app);

server.listen(port, () => {
    console.log('Server listening on port ' + port);
    deps['webSocket'].init(server);
});
