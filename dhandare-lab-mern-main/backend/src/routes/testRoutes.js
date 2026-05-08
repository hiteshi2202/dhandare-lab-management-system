const express = require('express');
const router = express.Router();
const { getAllTests, createTest, updateTest, deleteTest } = require('../controllers/testController');

// We will add "Admin Protection" middleware later. For now, it is open.
router.get('/', getAllTests);
router.post('/', createTest);
router.put('/:id', updateTest);
router.delete('/:id', deleteTest);

module.exports = router;