// --- 1. IMPORTS ---
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// --- 2. CONFIGURATION ---
const MY_EMAIL = 'desaiayush487@gmail.com'; 
const MY_PASSWORD = 'zmtjjqkdiqfptcmq'; 

// --- 3. INTERNAL EMAIL HELPER FUNCTION ---
const sendEmailInternal = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: MY_EMAIL, pass: MY_PASSWORD },
    });

    await transporter.sendMail({
      from: `Dhandare Lab <${MY_EMAIL}>`,
      to: to,
      subject: subject,
      html: `<div style="padding: 20px; border: 1px solid #ddd;">
               <h2 style="color: blue;">Dhandare Lab Notification</h2>
               <p>${text.replace(/\n/g, '<br>')}</p>
             </div>`,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email Failed: ${error.message}`);
  }
};

// --- 4. CONTROLLER FUNCTIONS ---

// A. Book Appointment (UPDATED FOR MULTI-TEST CART)
const bookAppointment = async (req, res) => {
  try {
    const { 
        testIds, // Received as a JSON string from frontend
        appointmentDate, appointmentTime,
        patientAge, patientPhone, collectionType,
        deliveryAddress, doctorName, totalAmount,
        paymentMethod, transactionId 
    } = req.body;

    const parsedTestIds = JSON.parse(testIds);

    let paymentScreenshot = null;
    if (req.file) {
      paymentScreenshot = `/uploads/${req.file.filename}`; 
    }

    const newAppointment = new Appointment({
      patientId: req.user._id,
      testIds: parsedTestIds, 
      appointmentDate, 
      appointmentTime,
      patientAge, 
      patientPhone, 
      collectionType,
      deliveryAddress, 
      doctorName, 
      totalAmount,
      paymentMethod: paymentMethod || 'Pay at Venue',
      transactionId: transactionId || null,
      paymentScreenshot: paymentScreenshot,
      paymentStatus: paymentMethod === 'Pay Now' ? 'Pending' : 'Not Applicable',
      status: 'Pending'
    });

    const savedAppointment = await newAppointment.save();

    const patient = await User.findById(req.user._id);
    if (patient && patient.email) {
      let message = `Hello ${patient.fullName},\n\nYour appointment for ${parsedTestIds.length} test(s) has been received.\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nTotal Amount: Rs. ${totalAmount}\n`;
      
      if (paymentMethod === 'Pay Now') {
        message += `\nYour payment (Transaction ID: ${transactionId}) is under review. You will receive a confirmation shortly.\n`;
      } else {
        message += `\nPlease pay at the venue.\n`;
      }

      message += `\nRegards,\nDhandare Pathology Lab`;
      await sendEmailInternal(patient.email, 'Appointment Received', message);
    }

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// B. Get My Appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('testIds', 'name price')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// C. Get All Appointments (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patientId', 'fullName email')
      .populate('testIds', 'name price')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// D. Update Status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      appointment.status = status;
      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// E. AI Prediction: Heart
const predictHeartRisk = (req, res) => {
  const inputData = Object.values(req.body).map(Number);
  const pythonScriptPath = path.join(__dirname, '../../../ml_engine/predict.py');

  if (!fs.existsSync(pythonScriptPath)) {
    return res.status(500).json({ message: 'Server cannot find Python file' });
  }

  const pythonProcess = spawn('python3', [pythonScriptPath, JSON.stringify(inputData)]);

  pythonProcess.stdout.on('data', (data) => {
    const result = data.toString().trim();
    if (!res.headersSent) res.json({ prediction: parseInt(result) });
  });

  pythonProcess.stderr.on('data', (data) => {
    if (!res.headersSent) res.status(500).json({ message: 'Prediction Calculation Failed' });
  });
};

// F. Diabetes Prediction
const predictDiabetesRisk = (req, res) => {
  const inputData = Object.values(req.body).map(Number);
  const pythonScriptPath = path.join(__dirname, '../../../ml_engine/predict_diabetes.py');
  
  const pythonProcess = spawn('python3', [pythonScriptPath, JSON.stringify(inputData)]);

  pythonProcess.stdout.on('data', (data) => {
    if (!res.headersSent) res.json({ prediction: parseInt(data.toString().trim()) });
  });

  pythonProcess.stderr.on('data', (data) => console.error(`Error: ${data}`));
};

// G. Kidney Prediction
const predictKidneyRisk = (req, res) => {
  const inputData = Object.values(req.body).map(Number);
  const pythonScriptPath = path.join(__dirname, '../../../ml_engine/predict_kidney.py');

  const pythonCommand = process.env.NODE_ENV === 'production' ? 'python3' : 'python';
  const pythonProcess = spawn(pythonCommand, [pythonScriptPath, JSON.stringify(inputData)]);

  pythonProcess.stdout.on('data', (data) => {
    if (!res.headersSent) res.json({ prediction: parseInt(data.toString().trim()) });
  });

  pythonProcess.stderr.on('data', (data) => console.error(`Error: ${data}`));
};

// H. Upload Report
const uploadTestReport = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
      appointment.status = 'Completed';
      if (file) appointment.reportUrl = `/uploads/${file.filename}`;

      await appointment.save();
      res.status(200).json({ message: 'Report Uploaded & Status Updated', appointment });
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// NEW: Admin Approves Payment
const approvePayment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'fullName email')
      .populate('testIds', 'name');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.paymentStatus = 'Verified';
    appointment.status = 'Confirmed';
    await appointment.save();

    const testNames = appointment.testIds.map(t => t.name).join(', ');
    const message = `Dear ${appointment.patientId.fullName},\n\nYour payment for [ ${testNames} ] has been verified.✅\n\nDate: ${appointment.appointmentDate}\nTime: ${appointment.appointmentTime}\n\nThank you!`;
    
    await sendEmailInternal(appointment.patientId.email, 'Payment Verified', message);
    res.json({ message: 'Payment Approved and Email Sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve payment' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment removed permanently' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  uploadTestReport,
  predictHeartRisk,
  predictDiabetesRisk,
  predictKidneyRisk,
  approvePayment,
  deleteAppointment
};