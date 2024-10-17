const express = require('express');
const router = express.Router();
const Score = require('../models/Score');


const columnWeights = {
    'Column1': 0.3,
    'Column2': 0.05,
    'Column3': 0.1,
    'Column4': 0.2,
    'Column5': 0.05,
    'Column6': 0.05,
    'Column7': 0.1,
    'Column8': 0.05,
    'Column9': 0.05,
    'Column10': 0.02,
    'Column11': 0.02,
    'Column12': 0.01,
};


const calculateScore = (fileData, excelColumns, predefinedColumns, columnWeights) => {
    let totalScore = 0;

   
    predefinedColumns.forEach((col) => {
        const colIndex = excelColumns.indexOf(col);
        if (colIndex !== -1) {
            const colValues = fileData.map((row) => parseFloat(row[colIndex] || 0));
            const colMean = colValues.reduce((acc, val) => acc + val, 0) / colValues.length;

            
            const weight = columnWeights[col] || 0;  
            totalScore += colMean * weight;  
        }
    });

    return totalScore;
};


router.post('/upload', async (req, res) => {
    const { name, truckName, fileData, excelColumns } = req.body;

    const predefinedColumns = ['Column1', 'Column2', 'Column3', 'Column4', 'Column5', 'Column6', 'Column7', 'Column8', 'Column9', 'Column10', 'Column11', 'Column12'];

    
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
