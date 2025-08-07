import express from 'express';
import cors from 'cors';
import http from 'http';
import './modules/deps.ts';
import { supabase } from './db.ts';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
    res.send('server running');
});

app.get('/api/leaderboard/:limit', async (req, res) => {
    const limit = parseInt(req.params.limit, 10);
    if (isNaN(limit)){
        console.log(`Invalid limit (${req.params.limit}) NaN`);
        res.status(400).json({ error: 'Malformed request' });
    }

    let { data, error } = await supabase.from('leaderboard').select()
    .order('time', { ascending: true })
    .limit(limit);

    if (error) {
        console.log(`Failed to fetch the leaderboard (lim ${limit}) due to: ${JSON.stringify(error)}`);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
        return;
    }
    console.log(data);

    res.status(200).json({ leaderboard: data });
});

const server = http.createServer(app);

server.listen(port, () => {
    console.log('Server listening on port ' + port);
    deps['webSocket'].init(server);
});
