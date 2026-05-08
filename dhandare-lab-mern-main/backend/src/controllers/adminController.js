// --- 1. IMPORTS ---
const Appointment = require('../models/appointmentModel');
const Test = require('../models/testModel');
const User = require('../models/userModel'); 
const nodemailer = require('nodemailer'); 

// --- 2. CONFIGURATION ---
const MY_EMAIL = 'desaiayush487@gmail.com'; 
const MY_PASSWORD = 'hjtqcdixcfxoltet'; 

// @desc    Approve UPI Payment & Send Email
// @route   PUT /api/admin/appointments/:id/approve-payment
const approvePayment = async (req, res) => {
  try {
    // ONLY populate 'testIds' as 'testId' has been removed from the Schema
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'fullName email')
      .populate('testIds', 'name'); 

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.paymentStatus = 'Verified';
    appointment.status = 'Confirmed';
    await appointment.save();

    // Safe Test Name Logic for the Email
    let testNames = "Diagnostic Test";
    if (appointment.testIds && appointment.testIds.length > 0) {
      testNames = appointment.testIds.map(t => t.name).join(', ');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: MY_EMAIL, pass: MY_PASSWORD },
    });

    const mailOptions = {
      from: `Dhandare Lab <${MY_EMAIL}>`,
      to: appointment.patientId.email,
      subject: 'Payment Verified - Appointment Confirmed | Dhandare Lab',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2e7d32;">Payment Successful! ✅</h2>
          <p>Dear ${appointment.patientId.fullName},</p>
          <p>Your payment for <strong>${testNames}</strong> has been verified.</p>
          <br/>
          <h3>🗓️ Appointment Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${appointment.appointmentDate}</li>
            <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
          </ul>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Payment Approved and Email Sent!' });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: 'Error: ' + error.message });
  }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const testsConducted = await Appointment.countDocuments({ status: 'Completed' });

    // SAFE REVENUE: Sums up the totalAmount field while ignoring missing values
    const paidAppointments = await Appointment.find({ 
      status: { $in: ['Confirmed', 'Completed'] } 
    }).select('totalAmount');

    const totalRevenue = paidAppointments.reduce((acc, curr) => {
      return acc + (Number(curr.totalAmount) || 0);
    }, 0);

    // RECENT APPOINTMENTS: Removed the broken 'testId' population to stop the crash
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patientId', 'fullName')
      .populate('testIds', 'name'); 

    res.status(200).json({
      totalPatients: totalPatients || 0,
      testsConducted: testsConducted || 0,
      totalRevenue: totalRevenue || 0,
      recentAppointments: recentAppointments || []
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(200).json({ totalPatients: 0, totalRevenue: 0, recentAppointments: [] });
  }
};

// @desc    Get All Patients
// @route   GET /api/admin/patients
const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { approvePayment, getDashboardStats, getPatients };