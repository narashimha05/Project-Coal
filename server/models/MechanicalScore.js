const mongoose = require('mongoose');

const MechanicalScoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    truckName: { type: String, required: true },
    mechanicalColumns: [String],  
    mechanicalData: [Array],      
    score: { type: Number, required: true },
});

const MechanicalScore = mongoose.model('MechanicalScore', MechanicalScoreSchema);

module.exports = MechanicalScore;
