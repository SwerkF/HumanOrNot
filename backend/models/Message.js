const User = require('./User');
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    bot: { type: Boolean, default: false }
});

module.exports = mongoose.model("Message", MessageSchema);