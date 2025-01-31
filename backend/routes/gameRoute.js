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

    const token = decodeJwt(req.headers.authorization.split(' ')[1]);
    if(!token) {
        return res.status(401).json({ message: 'Accès refusé, token manquant.' });
    }

    const userId = token.userId;

    try {
        const games = await Game.find({ "players.id": userId });
        const formattedGames = games.map(game => {
            const userPlayer = game.players.find(player => player?.id?.toString() === userId);
            return {
                createdAt: game.createdAt,
                messageCount: game.messages.length,
                vote: userPlayer?.vote ?? 0,
                hadBot: game.hadBot
            };
        });
        res.json({ data: formattedGames });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

router.post('/vote', auth, async (req, res) => {
    try {
        const token = req.header('Authorization');

        if(!token) {
            return res.status(401).json({ message: "Accès refusé, token manquant" });
        }

        const decoded = decodeJwt(token.split(' ')[1]);

        const { gameId, vote } = req.body;

        const game = await Game.findOne({ gameId: gameId });

        if(!game) {
            return res.status(404).json({ message: "La partie n'existe pas." });
        }

        let player = game.players.find(player => {
            return player.id.toString() === decoded.userId;
        });

        if(!player) {
            return res.status(404).json({ message: "Joueur non trouvé." });
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
        res.status(500).json({ message: "Erreur serveur." });
    }
})

const decodeJwt = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

module.exports = router;
