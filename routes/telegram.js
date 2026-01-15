const express = require('express');
const router = express.Router();
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) console.warn('BOT_TOKEN not set');

async function sendMessage(chatId, text, extra = {}) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...extra
    });
  } catch (e) {
    console.error('sendMessage err', e.message);
  }
}

router.post('/webhook', async (req, res) => {
  const update = req.body;
  // Very simple handler: on /start send a link to webapp
  try {
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      if (text.startsWith('/start')) {
        const link = (process.env.BASE_URL || 'http://localhost:4000') + '/'; // change to web app URL
        await sendMessage(chatId, `Welcome to Bingo! Click here to open the web app: ${link}`);
      } else if (text.startsWith('/create')) {
        // call backend to create a game via axios or internal logic (not implemented here)
        await sendMessage(chatId, `Game creation via Telegram is not fully automated in this starter. Use the web UI.`);
      }
    }
  } catch (e) {
    console.error('webhook handler error', e);
  }
  res.sendStatus(200);
});

module.exports = router;
