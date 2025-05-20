const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    electionId: {
        type: String,
        required: true
    },
    choice: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;