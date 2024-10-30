const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const userRoutes = require("./routes/userRoutes");
const mechanicalRoutes = require("./routes/MechanicalRoutes");
const behavioralDumperRoutes = require("./routes/BehaviouralDumperRoutes");
const combinedLeaderboardRoutes = require("./routes/combinedLeaderboardRoutes");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api", mechanicalRoutes);
app.use("/api", behavioralDumperRoutes);
app.use("/api", combinedLeaderboardRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the backend!");
});

app.listen(PORT, () => {
    console.log("Server is running");
});
