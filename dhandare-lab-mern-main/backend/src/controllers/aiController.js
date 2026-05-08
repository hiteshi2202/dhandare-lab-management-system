const Test = require('../models/testModel');
const Appointment = require('../models/appointmentModel');

// @desc    Smart Health Assistant (Symptoms + FAQs + Status + Vitals)
// @route   POST /api/ai/suggest
const suggestTests = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({ message: 'Please ask a question.' });
  }

  const text = symptoms.toLowerCase();

  // --- 1. HANDLING REPORT STATUS CHECKS ---
  // If user enters an ID (e.g. "status of 64fc2...")
  const idMatch = text.match(/[0-9a-fA-F]{24}/);
  if (idMatch) {
    try {
      const appt = await Appointment.findById(idMatch[0]).populate('testId');
      if (appt) {
        return res.json({
          message: `Appointment Found for ${appt.testId.name}. Status: ${appt.status}. ${appt.reportUrl ? "Report is ready to download." : "Report is not generated yet."}`,
          tests: []
        });
      }
    } catch (err) { }
  }

  // --- 2. HEALTH VITALS & NORMAL RANGES ---
  const healthRules = [
    { 
      keywords: ['bp', 'blood pressure', 'hypertension'], 
      answer: "Normal Blood Pressure is usually around 120/80 mmHg. Ranges: Normal (<120/80), Elevated (120-129/<80), High Stage 1 (130-139/80-89)." 
    },
    { 
      keywords: ['heart rate', 'pulse', 'beats'], 
      answer: "A normal resting heart rate for adults ranges from 60 to 100 beats per minute. Athletes may have lower rates (40-60 bpm)." 
    },
    { 
      keywords: ['sugar', 'diabetes', 'glucose', 'insulin'], 
      answer: "Normal Blood Sugar levels: Fasting (70-99 mg/dL), Post-meal (<140 mg/dL). Prediabetes: Fasting (100-125 mg/dL). Diabetes: Fasting (126+ mg/dL)." 
    },
    { 
      keywords: ['temp', 'temperature', 'fever range'], 
      answer: "Normal body temperature is typically 98.6°F (37°C). A fever is generally considered to be 100.4°F (38°C) or higher." 
    },
    { 
      keywords: ['oxygen', 'spo2', 'saturation'], 
      answer: "Normal oxygen saturation (SpO2) is between 95% and 100%. Values below 90% are considered low." 
    },
    { 
      keywords: ['bmi', 'body mass'], 
      answer: "Normal BMI is 18.5 to 24.9. Overweight is 25-29.9, and Obese is 30 or higher." 
    },
    { 
      keywords: ['hemoglobin', 'hb', 'anemia'], 
      answer: "Normal Hemoglobin: Men (13.5-17.5 g/dL), Women (12.0-15.5 g/dL). Lower levels may indicate Anemia." 
    }
  ];

  for (const rule of healthRules) {
    if (rule.keywords.some(k => text.includes(k))) {
      return res.json({ message: rule.answer, tests: [] });
    }
  }

  // --- 3. GENERAL LAB FAQs ---
  const faqRules = [
    { keywords: ['location', 'address', 'where', 'place'], answer: "We are located at: Shop 10, City Center, MG Road, Pune. Near Central Park." },
    { keywords: ['time', 'open', 'close', 'hours', 'working'], answer: "Our lab is open Monday to Saturday, 7:00 AM to 9:00 PM. Sunday: 8:00 AM to 2:00 PM." },
    { keywords: ['contact', 'phone', 'number', 'call', 'mobile'], answer: "You can reach us at +91 9876543210 or email contact@dhandarelab.com." },
    { keywords: ['fasting', 'eat', 'food', 'drink'], answer: "Most blood tests (like Sugar, Lipid Profile) require 8-10 hours of fasting. Water is allowed." },
    { keywords: ['price', 'cost', 'rate', 'how much'], answer: "Please specify the test name to get the exact price, or browse our Test Catalogue." },
    { keywords: ['home', 'collection', 'visit'], answer: "Currently, we only offer offline lab visits. Home collection is coming soon!" }
  ];

  for (const rule of faqRules) {
    if (rule.keywords.some(k => text.includes(k))) {
      return res.json({ message: rule.answer, tests: [] });
    }
  }

  // --- 4. SYMPTOM CHECKER ---
  const symptomRules = [
    { keywords: ['fever', 'temperature', 'shivering'], testName: 'Complete Blood Count (CBC)' },
    { keywords: ['tired', 'fatigue', 'weak', 'pale'], testName: 'Hemoglobin' },
    { keywords: ['sugar', 'thirsty', 'urination', 'diabetic'], testName: 'Blood Sugar Fasting' },
    { keywords: ['throat', 'cough', 'cold'], testName: 'Thyroid Profile' },
    { keywords: ['joint', 'pain', 'swelling'], testName: 'Uric Acid' },
    { keywords: ['stomach', 'pain', 'vomit'], testName: 'Liver Function Test' },
    { keywords: ['chest', 'heart', 'breath'], testName: 'Lipid Profile' } 
  ];

  let suggestedTestNames = [];
  symptomRules.forEach(rule => {
    if (rule.keywords.some(keyword => text.includes(keyword))) {
      suggestedTestNames.push(rule.testName);
    }
  });
  suggestedTestNames = [...new Set(suggestedTestNames)];

  if (suggestedTestNames.length > 0) {
    try {
      const suggestions = await Test.find({ name: { $in: suggestedTestNames } });
      return res.json({ 
        message: `Based on your symptoms, we recommend checking these tests:`,
        tests: suggestions 
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // --- 5. FALLBACK ---
  res.json({ 
    message: "I didn't quite understand that. You can ask about 'Normal BP', 'Diabetes Range', 'Lab Timings', or describe your symptoms.",
    tests: [] 
  });
};

module.exports = { suggestTests };