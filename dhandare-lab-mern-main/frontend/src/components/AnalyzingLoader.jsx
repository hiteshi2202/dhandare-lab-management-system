import React, { useState, useEffect } from 'react';
import { Activity, Brain, CheckCircle, Search } from 'lucide-react';

const AnalyzingLoader = ({ type = "Heart" }) => {
  const [step, setStep] = useState(0);

  // Custom steps based on the disease type
  const steps = {
    Heart: ["Reading Vitals...", "Analyzing ECG Patterns...", "Calculating Risk Score..."],
    Diabetes: ["Checking Glucose Levels...", "Analyzing BMI & Age...", "Predicting Insulin Resistance..."],
    Kidney: ["Scanning Creatinine Levels...", "Checking Fluid Retention...", "Generating Kidney Report..."]
  }[type] || ["Processing...", "Analyzing...", "Finalizing..."];

  useEffect(() => {
    // Change text every 800ms to simulate "thinking"
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg border border-blue-100 animate-in fade-in zoom-in duration-300">
      
      {/* Animated Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white p-4 rounded-full border-2 border-blue-500 shadow-md">
           {type === 'Heart' && <Activity className="w-10 h-10 text-red-500 animate-pulse" />}
           {type === 'Diabetes' && <Activity className="w-10 h-10 text-yellow-500 animate-pulse" />} 
           {type === 'Kidney' && <Activity className="w-10 h-10 text-purple-500 animate-pulse" />}
        </div>
      </div>

      {/* Progress Text */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">AI Analysis in Progress</h3>
      <p className="text-blue-600 font-medium flex items-center gap-2">
        <Search className="w-4 h-4 animate-spin" /> 
        {steps[step]}
      </p>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
        <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      <p className="text-xs text-gray-400 mt-4">Running Random Forest Classifier...</p>
    </div>
  );
};

export default AnalyzingLoader;