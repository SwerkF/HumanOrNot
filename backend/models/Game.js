const Player = require('./Player');
const Message = require('./Message');
const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    gameId: { type: String, required: true },
    players: { type: [{ id: mongoose.Schema.Types.ObjectId, vote: Number }], required: true },
    messages: { type: [mongoose.Schema.Types.ObjectId], ref: 'Message', required: true },
    hadBot: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Game", GameSchema);