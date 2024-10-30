const mongoose = require('mongoose');

const BehavioralDumperSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Common identifier for both files
  behavioralData: {
    ES: { type: Number, default: 0 },
    LS: { type: Number, default: 0 },
    STB: { type: Number, default: 0 },
  },
  dumperData: {
    TTH: { type: Number, default: 0 },
    TL: { type: Number, default: 0 },
    HT: { type: Number, default: 0 },
    ET: { type: Number, default: 0 },
  },
  score: { type: Number, required: true }, // Calculated score based on weights
});

const BehavioralDumperScore = mongoose.model('BehavioralDumperScore', BehavioralDumperSchema);

module.exports = BehavioralDumperScore;
