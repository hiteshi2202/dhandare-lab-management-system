const express = require('express');
const router = express.Router();
const { suggestTests } = require('../controllers/aiController');

// Public route (anyone can check symptoms)
router.post('/suggest', suggestTests);

module.exports = router;