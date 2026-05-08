const Test = require('../models/testModel');

// @desc    Get all tests
// @route   GET /api/tests
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({});
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new test
// @route   POST /api/tests
const createTest = async (req, res) => {
  const { name, price, sampleType, fastingRequired, tat, description, normalRanges } = req.body;

  try {
    const testExists = await Test.findOne({ name });
    if (testExists) {
      return res.status(400).json({ message: 'Test already exists' });
    }

    const test = await Test.create({
      name, price, sampleType, fastingRequired, tat, description, normalRanges
    });

    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a test
// @route   PUT /api/tests/:id
const updateTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (test) {
      test.name = req.body.name || test.name;
      test.price = req.body.price || test.price;
      test.sampleType = req.body.sampleType || test.sampleType;
      test.tat = req.body.tat || test.tat;
      // Update other fields as needed
      
      const updatedTest = await test.save();
      res.json(updatedTest);
    } else {
      res.status(404).json({ message: 'Test not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a test
// @route   DELETE /api/tests/:id
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (test) {
      await test.deleteOne();
      res.json({ message: 'Test removed' });
    } else {
      res.status(404).json({ message: 'Test not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTests, createTest, updateTest, deleteTest };