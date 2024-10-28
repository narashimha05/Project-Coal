const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

const columnWeights = {
    'EFR': 0.2,
    'HRTVD': 0.15,
    'MET': 0.12,
    'ROT': 0.1,
    'ES': 0.08,
    'OP': 0.07,
    'EAPP': 0.06,
    'OT': 0.05,
    'CBP': 0.04,
    'RP': 0.04,
    'WBVS': 0.03,
    'FBP': 0.03,
    'CT': 0.03,
    'TKPH': 0.88,
    'LS': 0.04,
    'STB': 0.04,
};

// Columns that should yield a negative final value
const negativeColumns = ['EFR', 'ROT', 'ES', 'EAPP', 'OP', 'OT', 'WBVS', 'FBP', 'CT', 'MET', 'TKPH', 'CBP'];

// Columns that should yield a positive final value
const positiveColumns = ['RP', 'HRTVD', 'ES', 'LS', 'STB'];

const calculateScore = (fileData, excelColumns, predefinedColumns, columnWeights) => {
    let totalScore = 0;

    predefinedColumns.forEach((col) => {
        const colIndex = excelColumns.indexOf(col);  // Find the index of the column in Excel data
        if (colIndex !== -1) {
            // Extract column values
            const colValues = fileData.map((row) => parseFloat(row[colIndex] || 0));

            // Calculate column mean
            let colMean = colValues.reduce((acc, val) => acc + val, 0) / colValues.length;

            // Special handling for STB: subtract 30 from mean before applying weight
            if (col === 'STB') {
                colMean -= 30;
            }

            // Get column weight
            const weight = columnWeights[col] || 0;
            let weightedValue = colMean * weight;

            // Apply sign based on column type
            if (negativeColumns.includes(col)) {
                weightedValue = -Math.abs(weightedValue);
            } else if (positiveColumns.includes(col)) {
                weightedValue = Math.abs(weightedValue);
            }

            // Add to total score
            totalScore += weightedValue;
        }
    });

    console.log(`Total Score: ${totalScore}`);  // Log the final total score
    return totalScore;
};

router.post('/upload', async (req, res) => {
    const { name, truckName, fileData, excelColumns } = req.body;

    const predefinedColumns = [
        'EFR', 'HRTVD', 'MET', 'ROT', 'ES', 'OP', 'EAPP', 'OT', 'CBP', 
        'RP', 'WBVS', 'FBP', 'CT', 'TKPH', 'ES', 'LS', 'STB'
    ];

    const score = calculateScore(fileData, excelColumns, predefinedColumns, columnWeights);

    const newScore = new Score({
        name,
        truckName,
        excelColumns,
        fileData,
        score,
    });

    await newScore.save();

    return res.json({ success: true, score });
});

module.exports = router;
