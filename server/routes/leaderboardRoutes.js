const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Score.find().sort({ score: -1 }).limit(100); 
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
});

module.exports = router;
