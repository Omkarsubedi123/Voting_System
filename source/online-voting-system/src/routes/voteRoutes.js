const express = require('express');
const VoteController = require('../controllers/voteController');
const { authenticate } = require('../utils/authMiddleware');

const router = express.Router();

// Route for casting a vote
router.post('/cast', authenticate, VoteController.castVote);

// Route for retrieving voting results
router.get('/results/:electionId', VoteController.getResults);

module.exports = router;