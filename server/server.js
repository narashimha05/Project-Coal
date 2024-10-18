const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

mongoose.connect("mongodb://localhost:27017/leaderboard")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error: ', err));


    app.use('/api', userRoutes);
    app.use('/api', uploadRoutes);
    app.use('/api', leaderboardRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the backend!');
});

app.listen(PORT, () => {
    console.log("Server is running");
});