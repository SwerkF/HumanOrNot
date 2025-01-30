const User = require('./User');
const Message = require('./Message');

const GameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    users: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true },
    messages: { type: [mongoose.Schema.Types.ObjectId], ref: 'Message', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Game", GameSchema);