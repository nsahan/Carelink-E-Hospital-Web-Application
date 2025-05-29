import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, BarChart2, Download, Check } from 'lucide-react';

const StressAssessment = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const questions = [
    {
      id: 1,
      text: "How often have you felt overwhelmed by your responsibilities in the past month?",
      options: [
        { value: 0, label: "Never" },
        { value: 1, label: "Rarely" },
        { value: 2, label: "Sometimes" },
        { value: 3, label: "Often" },
        { value: 4, label: "Very Often" }
      ]
    },
    {
      id: 2,
      text: "How would you rate your sleep quality over the past month?",
      options: [
        { value: 4, label: "Very Poor" },
        { value: 3, label: "Poor" },
        { value: 2, label: "Fair" },
        { value: 1, label: "Good" },
        { value: 0, label: "Very Good" }
      ]
    },
    {
      id: 3,
      text: "How often do you experience physical symptoms of stress (headaches, muscle tension, etc.)?",
      options: [
        { value: 0, label: "Never" },
        { value: 1, label: "Rarely" },
        { value: 2, label: "Sometimes" },
        { value: 3, label: "Often" },
        { value: 4, label: "Very Often" }
      ]
    },
    {
      id: 4,
      text: "How well can you concentrate on tasks?",
      options: [
        { value: 0, label: "Very Well" },
        { value: 1, label: "Well" },
        { value: 2, label: "Moderately" },
        { value: 3, label: "Poorly" },
        { value: 4, label: "Very Poorly" }
      ]
    },
    {
      id: 5,
      text: "How often do you feel irritable or angry?",
      options: [
        { value: 0, label: "Never" },
        { value: 1, label: "Rarely" },
        { value: 2, label: "Sometimes" },
        { value: 3, label: "Often" },
        { value: 4, label: "Very Often" }
      ]
    }
  ];

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    const maxScore = questions.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    let severity;
    let recommendations;

    if (percentage < 25) {
      severity = "Low";
      recommendations = [
        "Maintain your current stress management practices",
        "Practice preventive self-care",
        "Consider starting a wellness journal"
      ];
    } else if (percentage < 50) {
      severity = "Moderate";
      recommendations = [
        "Incorporate daily relaxation exercises",
        "Establish a regular sleep schedule",
        "Consider trying meditation or mindfulness practices"
      ];
    } else if (percentage < 75) {
      severity = "High";
      recommendations = [
        "Prioritize stress reduction activities",
        "Consider talking to a mental health professional",
        "Evaluate and adjust work-life balance"
      ];
    } else {
      severity = "Severe";
      recommendations = [
        "Seek professional help",
        "Implement immediate stress reduction strategies",
        "Make significant lifestyle changes"
      ];
    }

    return {
      score: totalScore,
      maxScore,
      percentage,
      severity,
      recommendations
    };
  };

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const result = calculateResult();
      setResult(result);
      onComplete && onComplete(50); // Award points for completing assessment
    }
  };

  const renderAssessmentResults = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Assessment Complete</h3>
        <p className="text-gray-600">Here's your stress assessment results</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-semibold">Stress Level</h4>
            <p className={`text-2xl font-bold ${
              result.severity === "Low" ? "text-green-600" :
              result.severity === "Moderate" ? "text-yellow-600" :
              result.severity === "High" ? "text-orange-600" :
              "text-red-600"
            }`}>
              {result.severity}
            </p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={2 * Math.PI * 36}
                strokeDashoffset={2 * Math.PI * 36 * (1 - result.percentage / 100)}
                className={`${
                  result.severity === "Low" ? "text-green-500" :
                  result.severity === "Moderate" ? "text-yellow-500" :
                  result.severity === "High" ? "text-orange-500" :
                  "text-red-500"
                } transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{Math.round(result.percentage)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
            Recommendations
          </h4>
          {result.recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
            >
              <Check className="w-5 h-5 text-blue-500 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => {
              const data = {
                date: new Date().toISOString(),
                score: result.score,
                severity: result.severity,
                recommendations: result.recommendations
              };
              localStorage.setItem('lastStressAssessment', JSON.stringify(data));
            }}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Save Results
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {!result ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-semibold">Stress Assessment</h3>
              <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <motion.div
            key={currentQuestion}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h4 className="text-lg font-medium mb-6">{questions[currentQuestion].text}</h4>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex justify-between items-center group"
                >
                  <span>{option.label}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        renderAssessmentResults()
      )}
    </div>
  );
};

export default StressAssessment;
