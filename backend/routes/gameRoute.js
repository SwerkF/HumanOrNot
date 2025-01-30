const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Player = require('../models/Player');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const auth = require('../middleware/auth');

dotenv.config();

// Global route to get all games
router.get('/', async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get games by user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const games = await Game.find({ users: userId });
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/vote', auth, async (req, res) => {
    try {
        const token = req.header('Authorization');
        const decoded = decodeJwt(token.split(' ')[1]);

        const { gameId, vote } = req.body;

        const game = await Game.findOne({ gameId: gameId });

        if(!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        let player = game.players.find(player => {
            return player.id.toString() === decoded.userId;
        });

        if(!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        if(vote === true && game.hadBot === true) {
            player.vote = 0;
        } else if(vote === true && game.hadBot === false) {
            player.vote = 1;
        } else if(vote === false && game.hadBot === false) {
            player.vote = 0;
        } else if(vote === false && game.hadBot === true) {
            player.vote = 1;
        }

        game.save();

        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Route to get games grouped by CreatedAt for a user
router.get('/user/:userId/grouped', async (req, res) => {
    try {
        const userId = req.params.userId;
        const games = await Game.find({ users: userId });
        const groupedGames = games.reduce((acc, game) => {
            const date = game.createdAt.toISOString().split('T')[0];
            (acc[date] = acc[date] || []).push(game);
            return acc;
        }, {});
        res.json(groupedGames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const decodeJwt = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

module.exports = router;
