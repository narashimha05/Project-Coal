const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// Define column weights for mechanical and behavioral data
const columnWeights = {
    'EFR': 0.2, 'HRTVD': 0.15, 'MET': 0.12, 'ROT': 0.1, 'ES': 0.08, 
    'OP': 0.07, 'EAPP': 0.06, 'OT': 0.05, 'CBP': 0.04, 'RP': 0.04, 
    'WBVS': 0.03, 'FBP': 0.03, 'CT': 0.03, 'TKPH': 0.88, 'LS': 0.04, 'STB': 0.04,
};

// Columns yielding a negative or positive impact on the score
const negativeColumns = ['EFR', 'ROT', 'ES', 'EAPP', 'OP', 'OT', 'WBVS', 'FBP', 'CT', 'MET', 'TKPH', 'CBP'];
const positiveColumns = ['RP', 'HRTVD', 'ES', 'LS', 'STB'];

// Calculate the score for a given dataset (mechanical or behavioral)
const calculateScore = (fileData, excelColumns, predefinedColumns, columnWeights) => {
    let totalScore = 0;

    predefinedColumns.forEach((col) => {
        const colIndex = excelColumns.indexOf(col);
        if (colIndex !== -1) {
            const colValues = fileData.map((row) => parseFloat(row[colIndex] || 0));
            let colMean = colValues.reduce((acc, val) => acc + val, 0) / colValues.length;

            if (col === 'STB') {
                colMean -= 30;
            }

            const weight = columnWeights[col] || 0;
            let weightedValue = colMean * weight;

            if (negativeColumns.includes(col)) {
                weightedValue = -Math.abs(weightedValue);
            } else if (positiveColumns.includes(col)) {
                weightedValue = Math.abs(weightedValue);
            }

            totalScore += weightedValue;
        }
    });

    return totalScore;
};

// Calculate the dumper cycle score based on the formula (TTH * TL) / (HT + ET)
const calculateDumperScore = (dumperData, dumperColumns) => {
    const TTHIndex = dumperColumns.indexOf('TTH');
    const TLIndex = dumperColumns.indexOf('TL');
    const HTIndex = dumperColumns.indexOf('HT');
    const ETIndex = dumperColumns.indexOf('ET');

    const rowResults = dumperData.map(row => {
        const TTH = parseFloat(row[TTHIndex] || 0);
        const TL = parseFloat(row[TLIndex] || 0);
        const HT = parseFloat(row[HTIndex] || 0);
        const ET = parseFloat(row[ETIndex] || 0);

        return HT + ET !== 0 ? (TTH * TL) / (HT + ET) : 0;
    });

    const meanRowResult = rowResults.reduce((acc, val) => acc + val, 0) / rowResults.length;
    return meanRowResult * -0.88;
};

router.post('/upload', async (req, res) => {
    const { name, truckName, mechanicalData = [], mechanicalColumns = [], behavioralData = [], behavioralColumns = [], dumperData = [], dumperColumns = [] } = req.body;

    // Define column sets for mechanical, behavioral, and dumper files
    const mechanicalPredefinedColumns = [
        'EFR', 'HRTVD', 'MET', 'ROT', 'ES', 'OP', 'EAPP', 'OT', 'CBP', 
        'RP', 'WBVS', 'FBP', 'CT'
    ];
    const behavioralPredefinedColumns = ['ES', 'LS', 'STB'];
    const dumperPredefinedColumns = ['TTH', 'TL', 'HT', 'ET'];

    // Calculate scores conditionally
    const mechanicalScore = mechanicalData.length > 0 
        ? calculateScore(mechanicalData, mechanicalColumns, mechanicalPredefinedColumns, columnWeights) 
        : 0;

    const behavioralScore = behavioralData.length > 0 
        ? calculateScore(behavioralData, behavioralColumns, behavioralPredefinedColumns, columnWeights) 
        : 0;

    const dumperScore = dumperData.length > 0 
        ? calculateDumperScore(dumperData, dumperColumns) 
        : 0;

    // Combine the scores
    const totalScore = mechanicalScore + behavioralScore + dumperScore;

    // Save the combined score to the database
    const newScore = new Score({
        name,
        truckName,
        mechanicalColumns,
        behavioralColumns,
        dumperColumns,
        mechanicalData,
        behavioralData,
        dumperData,
        score: totalScore,
    });

    await newScore.save();

    return res.json({ success: true, score: totalScore });
});

module.exports = router;
