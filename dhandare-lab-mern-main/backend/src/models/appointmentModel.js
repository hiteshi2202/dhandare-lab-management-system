const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // CHANGED: testId (single) to testIds (array)
    testIds: [{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Test',
    }],
    appointmentDate: {
      type: String,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    patientAge: {
      type: String,
      required: false
    },
    patientPhone: {
      type: String,
      required: false
    },
    doctorName: {
      type: String,
      required: false
    },
    collectionType: {
      type: String, // 'Lab Visit' or 'Home Collection'
      required: true,
      default: 'Lab Visit'
    },
    deliveryAddress: {
      type: String, // Only used if Home Collection is selected
      required: false
    },
    totalAmount: {
      type: Number,
      required: false
    },

    // --- PAYMENT SYSTEM FIELDS ---
    paymentMethod: {
      type: String,
      enum: ['Pay at Venue', 'Pay Now'],
      default: 'Pay at Venue'
    },
    transactionId: {
      type: String, // UPI Ref Number
      default: null
    },
    paymentScreenshot: {
      type: String, // URL/Path of the uploaded image
      default: null
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Not Applicable'], // 'Not Applicable' is for Pay at Venue
      default: 'Not Applicable'
    },
    
    // --- UPLOAD FIELD ---
    reportUrl: {
      type: String,
      required: false 
    }
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;