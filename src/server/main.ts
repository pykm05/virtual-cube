import express from 'express';
import cors from 'cors';
import http from 'http';
import './modules/deps.ts';
import { test } from './db.ts';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
    res.send('server running');
});

const server = http.createServer(app);

server.listen(port, () => {
    console.log('Server listening on port ' + port);
    deps['webSocket'].init(server);
});

await test();
