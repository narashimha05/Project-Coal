const express = require('express');
const router = express.Router();
const BehavioralDumperScore = require('../models/BehaviouralDumperScore');

router.get('/behavioral', async (req, res) => {
    try {
        // Fetch and sort entries by score in descending order
        const leaderboard = await BehavioralDumperScore.find({}, 'name score')
            .sort({ score: -1 }) // Sort by score in descending order
            .exec();

        // Respond with the sorted leaderboard
        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ success: false, error: "Failed to retrieve leaderboard" });
    }
});
module.exports = router;