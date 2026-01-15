require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const gameRoutes = require('./routes/game');
const telegramRoutes = require('./routes/telegram');

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

app.use(cors());
app.use(bodyParser.json());

// connect to mongo
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bingo';
mongoose.connect(MONGO_URI, { })
  .then(()=> console.log('Mongo connected'))
  .catch(err => console.error('mongo err', err));

// routes
app.use('/api/game', gameRoutes);
app.use('/api/telegram', telegramRoutes);

// static frontend in production (optional)
app.use('/', express.static('../frontend/dist'));

// sockets
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('join-game', ({ gameId }) => {
    if (!gameId) return;
    socket.join(String(gameId));
    console.log('socket join', socket.id, '->', gameId);
  });
});

// health
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=> console.log('Server listening on', PORT));
