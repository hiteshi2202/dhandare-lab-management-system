require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const adminRoutes = require('./src/routes/adminRoutes'); // <--- Import


// Import Routes
const authRoutes = require('./src/routes/authRoutes.js');
const testRoutes = require('./src/routes/testRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const aiRoutes = require('./src/routes/aiRoutes'); // <--- NEW IMPORT

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // Allows any website to talk to your backend
    credentials: true
}));

// Database Connection
connectDB();

// Make uploads public
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes); // <--- NEW ROUTE
app.use('/api/admin', adminRoutes); // <--- Add Route
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('Dhandare Lab API is Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));