const express = require('express');
const router = express.Router();
const { getDashboardStats, getPatients } = require('../controllers/adminController'); // Import
const { protect, admin } = require('../middlewares/authMiddleware');
const { approvePayment } = require('../controllers/adminController');

router.get('/stats', protect, getDashboardStats);
router.get('/patients', protect, getPatients); // New Route
router.put('/appointments/:id/approve-payment', protect, admin, approvePayment);

module.exports = router;
module.exports = router;