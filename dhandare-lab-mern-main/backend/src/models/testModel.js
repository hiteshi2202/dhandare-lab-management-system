const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  sampleType: { type: String, required: true }, // e.g., 'Blood', 'Urine'
  fastingRequired: { type: Boolean, default: false },
  tat: { type: String, required: true }, // Turnaround Time (e.g., '24 hrs')
  description: { type: String },
  
  // Normal ranges are complex, so we use an array of objects
  normalRanges: [
    {
      parameter: String, // e.g., "Hemoglobin"
      low: Number,
      high: Number,
      unit: String // e.g., "g/dL"
    }
  ],
  
  isActive: { type: Boolean, default: true }, // If false, hide from website
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', testSchema);