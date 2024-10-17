const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    truckName: { type: String, required: true },
    excelColumns: [String],  
    fileData: [Array],      
    score: { type: Number, required: true },
});

// Create the Score model
const Score = mongoose.model('Score', ScoreSchema);

module.exports = Score;
