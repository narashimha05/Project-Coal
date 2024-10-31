const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const MechanicalScore = require('../models/MechanicalScore');
const BehavioralDumperScore = require('../models/BehaviouralDumperScore');

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
            const colMean = colValues.reduce((acc, val) => acc + val, 0) / colValues.length;

            const weight = columnWeights[col] || 0;
            let weightedValue = colMean * weight;

            // Apply negative or positive weighting
            weightedValue = negativeColumns.includes(col) ? -Math.abs(weightedValue) : Math.abs(weightedValue);
            totalScore += weightedValue;
        }
    });

    return totalScore;
};

// Calculate combined score for behavioral and dumper data
const calculateCombinedScore = (behavioralData, dumperData) => {
    const combinedData = {};

    // Process behavioral data
    behavioralData.forEach(row => {
        const name = row[0];
        if (!name) {
            console.warn("Missing NAME in behavioralData row:", row);
            return;
        }
        if (!combinedData[name]) {
            combinedData[name] = { NAME: name, ES: 0, LS: 0, STB: 0, TTH: 0, TL: 0, HT: 0, ET: 0 };
        }
        combinedData[name].ES += parseFloat(row[1] || 0) || 0;
        combinedData[name].LS += parseFloat(row[2] || 0) || 0;
        combinedData[name].STB += parseFloat(row[3] || 0) || 0;
    });

    // Process dumper data
    dumperData.forEach(row => {
        const name = row[0];
        if (!name) {
            console.warn("Missing NAME in dumperData row:", row);
            return;
        }
        if (!combinedData[name]) {
            combinedData[name] = { NAME: name, ES: 0, LS: 0, STB: 0, TTH: 0, TL: 0, HT: 0, ET: 0 };
        }
        combinedData[name].TTH += parseFloat(row[1] || 0) || 0;
        combinedData[name].TL += parseFloat(row[2] || 0) || 0;
        combinedData[name].HT += parseFloat(row[3] || 0) || 0;
        combinedData[name].ET += parseFloat(row[4] || 0) || 0;
    });

    // Calculate weighted score for each entry
    return Object.values(combinedData).map(row => {
        const weightedScore = (
            (row.ES * (columnWeights['ES'] || 0)) +
            (row.LS * (columnWeights['LS'] || 0)) +
            (row.STB * (columnWeights['STB'] || 0)) +
            (row.TTH * (columnWeights['TTH'] || 0)) +
            (row.TL * (columnWeights['TL'] || 0)) +
            (row.HT * (columnWeights['HT'] || 0)) +
            (row.ET * (columnWeights['ET'] || 0))
        );

        return {
            NAME: row.NAME,
            score: isNaN(weightedScore) || !isFinite(weightedScore) ? 0 : weightedScore
        };
    });
};

// Calculate the dumper cycle score based on the formula (TTH * TL) / (HT + ET)
const calculateDumperScore = (dumperData, dumperColumns) => {
    // Identify the index of required columns
    const TTHIndex = dumperColumns.indexOf('TTH');
    const TLIndex = dumperColumns.indexOf('TL');
    const HTIndex = dumperColumns.indexOf('HT');
    const ETIndex = dumperColumns.indexOf('ET');

    // Verify if all required columns are available
    if (TTHIndex === -1 || TLIndex === -1 || HTIndex === -1 || ETIndex === -1) {
        console.error("Missing one or more required columns (TTH, TL, HT, ET) in dumperColumns.");
        return 0;
    }

    // Calculate results per row, logging each step to verify data handling
    const rowResults = dumperData.map((row, rowIndex) => {
        const TTH = parseFloat(row[TTHIndex] || 0);
        const TL = parseFloat(row[TLIndex] || 0);
        const HT = parseFloat(row[HTIndex] || 0);
        const ET = parseFloat(row[ETIndex] || 0);

        console.log(`Row ${rowIndex}: TTH=${TTH}, TL=${TL}, HT=${HT}, ET=${ET}`);

        // Handle division by zero if HT + ET equals zero
        const result = (HT + ET) !== 0 ? (TTH * TL) / (HT + ET) : 0;
        
        // Log the computed result for this row
        console.log(`Row ${rowIndex} Result: ${result}`);

        return result;
    });

    // Filter out NaN or infinite values
    const validRowResults = rowResults.filter(result => !isNaN(result) && isFinite(result));

    // Calculate mean of valid results, if any are valid
    const meanRowResult = validRowResults.length > 0
        ? validRowResults.reduce((acc, val) => acc + val, 0) / validRowResults.length
        : 0;

    // Log the mean result before applying the weight factor
    console.log(`Mean Row Result (before weight): ${meanRowResult}`);

    // Apply the -0.88 weight factor
    const weightedScore = meanRowResult * -0.88;
    console.log(`Final Dumper Score (after weight): ${weightedScore}`);

    return weightedScore;
};




// Main upload route
router.post('/upload', async (req, res) => {
    const { name, truckName, mechanicalData = [], mechanicalColumns = [], behavioralData = [], behavioralColumns = [], dumperData = [], dumperColumns = [] } = req.body;

    const mechanicalPredefinedColumns = ['EFR', 'HRTVD', 'MET', 'ROT', 'ES', 'OP', 'EAPP', 'OT', 'CBP', 'RP', 'WBVS', 'FBP', 'CT'];
    const behavioralPredefinedColumns = ['ES', 'LS', 'STB'];

    const mechanicalScore = mechanicalData.length > 0 ? calculateScore(mechanicalData, mechanicalColumns, mechanicalPredefinedColumns, columnWeights) : 0;
    const behavioralScore = behavioralData.length > 0 ? calculateScore(behavioralData, behavioralColumns, behavioralPredefinedColumns, columnWeights) : 0;
    const dumperScore = dumperData.length > 0 ? calculateDumperScore(dumperData, dumperColumns) : 0;

    const totalScore = mechanicalScore + behavioralScore + dumperScore;

    try {
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
        res.json({ success: true, score: totalScore });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error saving total score.' });
    }
});

// Route to handle mechanical score calculation and storage
router.post('/mechanical', async (req, res) => {
    const { name, truckName, mechanicalData = [], mechanicalColumns = [] } = req.body;

    const mechanicalPredefinedColumns = ['EFR', 'HRTVD', 'MET', 'ROT', 'ES', 'OP', 'EAPP', 'OT', 'CBP', 'RP', 'WBVS', 'FBP', 'CT'];

    const mechanicalScore = mechanicalData.length > 0 ? calculateScore(mechanicalData, mechanicalColumns, mechanicalPredefinedColumns, columnWeights) : 0;

    try {
        const newScore = new MechanicalScore({
            name,
            truckName,
            mechanicalColumns,
            mechanicalData,
            score: mechanicalScore,
        });
        await newScore.save();
        res.json({ success: true, score: mechanicalScore });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error saving mechanical score.' });
    }
});

// Route to handle combined behavioral and dumper score calculation and storage
router.post('/behavioral', async (req, res) => {
    const { behavioralData = [], behavioralColumns = [], dumperData = [], dumperColumns = [] } = req.body;

    const scores = calculateCombinedScore(behavioralData, dumperData);
    const dumperScore = calculateDumperScore(dumperData, dumperColumns);
    const savedScores = [];

    for (const scoreEntry of scores) {
        if (!scoreEntry.NAME) {
            console.warn("Missing NAME for entry:", scoreEntry);
            continue;
        }
        const totalScore = scoreEntry.score + dumperScore;

        const newScore = new BehavioralDumperScore({
            name: scoreEntry.NAME,
            behavioralColumns,
            behavioralData,
            dumperColumns,
            dumperData,
            score: totalScore,
        });

        try {
            const savedScore = await newScore.save();
            savedScores.push(savedScore);
        } catch (error) {
            console.error(`Failed to save score for ${scoreEntry.NAME}:`, error);
            return res.status(500).json({ success: false, error: `Failed to save score for ${scoreEntry.NAME}` });
        }
    }

    res.json({ success: true, savedScores });
});

module.exports = router;
