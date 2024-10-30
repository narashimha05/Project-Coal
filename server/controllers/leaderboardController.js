// controllers/leaderboardController.js
const BehavioralDumperScore = require('../models/BehaviouralDumperScore');
const MechanicalScore = require('../models/MechanicalScore');

const getLeaderboard = async (req, res) => {
  try {
    // Step 1: Fetch all BehavioralDumperScores and MechanicalScores
    const behavioralScores = await BehavioralDumperScore.find({});
    const mechanicalScores = await MechanicalScore.find({});

    // Step 2: Create a map to store aggregated scores
    const scoresMap = new Map();

    // Step 3: Aggregate scores from BehavioralDumperScore
    behavioralScores.forEach((entry) => {
      scoresMap.set(entry.name, {
        name: entry.name,
        score: entry.score,
      });
    });

    // Step 4: Add scores from MechanicalScore, checking if names match
    mechanicalScores.forEach((entry) => {
      if (scoresMap.has(entry.name)) {
        scoresMap.get(entry.name).score += entry.score; // Add mechanical score to existing score
      } else {
        // If no match in behavioralScores, just add the mechanical score
        scoresMap.set(entry.name, {
          name: entry.name,
          score: entry.score,
        });
      }
    });

    // Step 5: Convert map to array and sort by score in descending order
    const leaderboard = Array.from(scoresMap.values()).sort((a, b) => b.score - a.score);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getLeaderboard };
