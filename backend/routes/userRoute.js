const User = require("../models/User");
const jwt = require("jsonwebtoken");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
   
    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides." });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
   
    try {
        const user = await User.create({ username, email, password });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
});

module.exports = router;