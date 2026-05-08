const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middlewares/authMiddleware');
const { approvePayment } = require('../controllers/adminController');
// ⚠️ IMPORT ALL CONTROLLERS (Double Check this part!)
const {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  uploadTestReport,
  predictHeartRisk,
  predictDiabetesRisk,
  predictKidneyRisk,
  deleteAppointment
} = require('../controllers/appointmentController');

// Configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// Patient
// ⚠️ UPDATED: Added upload.single('paymentScreenshot') to handle the UPI QR screenshot
router.post('/book', protect, upload.single('paymentScreenshot'), bookAppointment);
router.get('/my', protect, getMyAppointments);

// Admin
router.get('/all', protect, admin, getAllAppointments);
router.put('/:id/status', protect, admin, updateAppointmentStatus);
router.post('/:id/upload', protect, admin, upload.any(), uploadTestReport);
router.put('/:id/approve-payment', protect, admin, approvePayment);
router.delete('/:id', protect, admin, deleteAppointment);

// AI Prediction Routes
router.post('/predict-heart', predictHeartRisk);
router.post('/predict-diabetes', predictDiabetesRisk); // ⚠️ THIS LINE WAS LIKELY MISSING OR BROKEN
router.post('/predict-kidney', predictKidneyRisk);

module.exports = router;