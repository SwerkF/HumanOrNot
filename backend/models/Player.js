const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    vote: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Player", PlayerSchema);
