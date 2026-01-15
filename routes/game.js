const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const Board = require('../models/Board');
const { generateCard } = require('../utils/cards');
const { isWinningBoard } = require('../utils/bingo');
const mongoose = require('mongoose');

// Create new game
router.post('/', async (req, res) => {
  const { stake } = req.body;
  const g = new Game({ stake: stake || 10 });
  await g.save();
  res.json(g);
});

// Join game: create a user & board (simplified)
router.post('/:gameId/join', async (req, res) => {
  const { name, telegramId } = req.body;
  const game = await Game.findById(req.params.gameId);
  if (!game) return res.status(404).json({ error: 'game not found' });

  const user = new User({ telegramId, displayName: name });
  await user.save();
  game.players.push(user._id);
  await game.save();

  const { grid, marks } = generateCard();
  const board = new Board({
    gameId: game._id,
    owner: user._id,
    grid,
    marks,
    boardNumber: Math.floor(Math.random()*1000)
  });
  await board.save();
  res.json({ user, board });
});

// Get game state
router.get('/:gameId/state', async (req, res) => {
  const game = await Game.findById(req.params.gameId).lean();
  if (!game) return res.status(404).json({ error: 'game not found' });
  const boards = await Board.find({ gameId: game._id }).lean();
  res.json({ game, boards });
});

// Call next number (admin or server)
router.post('/:gameId/call', async (req, res) => {
  const game = await Game.findById(req.params.gameId);
  if (!game) return res.status(404).json({ error: 'game not found' });

  // simple random call from remaining numbers
  const called = new Set(game.calls || []);
  const pool = Array.from({length:75}, (_,i)=>i+1).filter(n => !called.has(n));
  if (pool.length === 0) return res.status(400).json({ error: 'no more numbers' });
  const pick = pool[Math.floor(Math.random() * pool.length)];
  game.calls.push(pick);
  if (game.status === 'waiting') game.status = 'started';
  await game.save();

  // emit via socket - we'll use io saved on app
  const io = req.app.get('io');
  if (io) io.to(String(game._id)).emit('call', pick);
  res.json({ pick, calls: game.calls });
});

// Claim bingo
router.post('/:gameId/bingo', async (req, res) => {
  const { boardId } = req.body;
  const game = await Game.findById(req.params.gameId);
  const board = await Board.findById(boardId);
  if (!game || !board) return res.status(404).json({ error: 'not found' });

  const calledSet = new Set(game.calls);
  if (isWinningBoard(board.grid, calledSet)) {
    // attempt to atomically set game ended (prevent race winners)
    const updated = await Game.findOneAndUpdate(
      { _id: game._id, status: { $ne: 'ended' } },
      { $set: { status: 'ended' } },
      { new: true }
    );
    if (!updated) {
      return res.json({ ok: false, reason: 'someone already won' });
    }
    const io = req.app.get('io');
    if (io) io.to(String(game._id)).emit('winner', { boardId, winner: board.owner });
    return res.json({ ok: true, winner: board.owner });
  } else {
    return res.json({ ok: false, reason: 'invalid bingo' });
  }
});

module.exports = router;
