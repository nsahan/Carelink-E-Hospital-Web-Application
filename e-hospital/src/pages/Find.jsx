import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, BookOpen, MapPin, Activity, ArrowRight, ChevronDown, X, Scale, Calculator, Clock } from 'lucide-react';
import Doctors from './Doctors';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const Find = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('diseases');
  const [activeHealthTool, setActiveHealthTool] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    { name: 'Common Conditions', count: 124 },
    { name: 'Chronic Diseases', count: 86 },
    { name: 'Mental Health', count: 53 },
    { name: 'Children\'s Health', count: 42 },
    { name: 'Women\'s Health', count: 38 },
  ];

  const featuredDiseases = [
    {
      title: 'Diabetes',
      description: 'Learn about types, symptoms, treatments, and management strategies.',
      icon: <Activity size={20} className="text-blue-500" />,
      articles: 24
    },
    {
      title: 'Hypertension',
      description: 'Understanding high blood pressure causes, risks, and prevention.',
      icon: <Heart size={20} className="text-red-500" />,
      articles: 18
    },
    {
      title: 'Asthma',
      description: 'Respiratory condition affecting airways - causes, treatments & care.',
      icon: <Activity size={20} className="text-green-500" />,
      articles: 16
    }
  ];

  const recentSearches = ['COVID-19', 'Allergies', 'Migraine', 'Back Pain'];

  const healthTools = [
    {
      id: 'bmi-calculator',
      name: 'BMI Calculator',
      icon: <Activity className="mr-3 text-blue-500" size={20} />,
      component: <BMICalculator />
    },
    {
      id: 'heart-risk',
      name: 'Heart Disease Risk Assessment',
      icon: <Heart className="mr-3 text-red-500" size={20} />,
      component: <HeartRiskAssessment />
    },
    {
      id: 'medical-dictionary',
      name: 'Medical Dictionary',
      icon: <BookOpen className="mr-3 text-green-500" size={20} />,
      component: <MedicalDictionary />
    }
  ];

  const handleToolClick = (toolId) => {
    setActiveHealthTool(toolId === activeHealthTool ? null : toolId);
  };

  const searchDiseases = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{
            parts: [{
              text: `As a medical expert, provide information about "${query}" in this format:
              {
                "disease": "name of disease",
                "shortDescription": "brief overview in 1-2 sentences",
                "symptoms": ["symptom1", "symptom2", "symptom3"],
                "severity": "mild/moderate/severe",
                "whenToSeekHelp": "brief guidance",
                "category": "disease category"
              }
              Only provide factual medical information. If the query is not a valid disease, return null.`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer AIzaSyA1AT_43Vfydy2zqJFalwV_pbf_Dezsxf0'
          },
          params: {
            key: 'AIzaSyA1AT_43Vfydy2zqJFalwV_pbf_Dezsxf0'  // Add API key as URL parameter
          }
        }
      );

      const result = response.data.candidates[0].content.parts[0].text;
      try {
        const parsedResult = JSON.parse(result);
        if (parsedResult) {
          setSearchResults([parsedResult]);
        }
      } catch (error) {
        console.error('Failed to parse API response:', error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'specialists':
        return <Doctors />;
      case 'diseases':
        return renderDiseasesContent();
      case 'treatments':
        return renderTreatmentsContent();
      case 'symptoms':
        return renderSymptomsContent();
      default:
        return renderDiseasesContent();
    }
  };

  const renderSearchBox = () => (
    <div className="relative mx-auto max-w-2xl">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && searchDiseases(searchQuery)}
        placeholder="Search for diseases or medical conditions..."
        className="w-full px-6 py-4 pr-12 rounded-lg shadow-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        onClick={() => searchDiseases(searchQuery)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
        disabled={isSearching}
      >
        {isSearching ? (
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
        ) : (
          <Search size={24} />
        )}
      </button>
    </div>
  );

  const renderSearchResults = () => {
    if (!searchResults.length && searchQuery) {
      return (
        <div className="mt-8 text-center text-gray-600">
          No results found for "{searchQuery}"
        </div>
      );
    }

    return searchResults.map((result, index) => (
      <div key={index} className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{result.disease}</h2>
        <div className="inline-block px-3 py-1 mb-4 bg-blue-100 text-blue-800 rounded-full text-sm">
          {result.category}
        </div>
        <p className="text-gray-600 mb-4">{result.shortDescription}</p>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Common Symptoms:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {result.symptoms.map((symptom, idx) => (
              <li key={idx}>{symptom}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Severity Level:</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${result.severity === 'severe' ? 'bg-red-100 text-red-800' :
            result.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
            {result.severity}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">When to Seek Help:</h3>
          <p className="text-gray-600">{result.whenToSeekHelp}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      {/* Removed Find Health Information hero section */}
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {renderSearchResults()}
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('diseases')}
            className={`px-4 py-2 mr-4 text-lg font-medium ${activeTab === 'diseases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
          </button>
          <button
            onClick={() => setActiveTab('treatments')}
            className={`px-4 py-2 mr-4 text-lg font-medium ${activeTab === 'treatments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`px-4 py-2 mr-4 text-lg font-medium ${activeTab === 'symptoms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
          </button>
          <button
            onClick={() => setActiveTab('specialists')}
            className={`px-4 py-2 text-lg font-medium ${activeTab === 'specialists' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Health Tools</h3>
              <ul>
                {healthTools.map((tool) => (
                  <li key={tool.id} className="mb-3">
                    <button
                      className={`flex items-center w-full text-left ${activeHealthTool === tool.id ? 'text-blue-600 font-medium' : 'text-gray-700'} hover:text-blue-600 transition-colors`}
                      onClick={() => handleToolClick(tool.id)}
                    >
                      {tool.icon}
                      <span>{tool.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Active Health Tool */}
            {activeHealthTool && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    {healthTools.find(tool => tool.id === activeHealthTool)?.icon}
                    <h2 className="text-2xl font-bold">{healthTools.find(tool => tool.id === activeHealthTool)?.name}</h2>
                  </div>
                  <button
                    onClick={() => setActiveHealthTool(null)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  {healthTools.find(tool => tool.id === activeHealthTool)?.component}
                </div>
              </div>
            )}

            {/* Featured Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Featured Health Information</h2>
                <button className="text-blue-600 text-sm font-medium"></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredDiseases.map((disease, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start mb-2">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        {disease.icon}
                      </div>
                      <h3 className="text-lg font-semibold">{disease.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{disease.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500"></span>
                      <button className="text-blue-600 flex items-center text-sm hover:underline">
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer">
                </div>
              </div>
            </div>

            {/* Popular Health Topics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Popular Health Topics</h2>
              <div className="flex flex-wrap gap-2">
                {['Diabetes', 'Heart Disease', 'Anxiety', 'Depression', 'COVID-19', 'Arthritis', 'Cancer', 'Allergies', 'Sleep Disorders', 'ADHD', 'Alzheimer\'s', 'Hypertension'].map((topic, index) => (
                  <button key={index} className="bg-gray-100 hover:bg-blue-100 text-gray-800 hover:text-blue-700 px-4 py-2 rounded-full text-sm transition-colors">
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// BMI Calculator Component
const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('metric'); // metric or imperial
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');

  const calculateBMI = () => {
    if (!height || !weight) return;

    let bmiValue;
    if (unit === 'metric') {
      // Metric: weight (kg) / [height (m)]²
      bmiValue = weight / ((height / 100) * (height / 100));
    } else {
      // Imperial: 703 × weight (lbs) / [height (in)]²
      bmiValue = 703 * (weight / (height * height));
    }

    setBmi(bmiValue.toFixed(1));

    // Set BMI category
    if (bmiValue < 18.5) {
      setCategory('Underweight');
    } else if (bmiValue < 25) {
      setCategory('Normal weight');
    } else if (bmiValue < 30) {
      setCategory('Overweight');
    } else {
      setCategory('Obesity');
    }
  };

  const getBmiColor = () => {
    if (!bmi) return 'text-gray-600';
    if (bmi < 18.5) return 'text-blue-500';
    if (bmi < 25) return 'text-green-500';
    if (bmi < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const resetCalculator = () => {
    setHeight('');
    setWeight('');
    setBmi(null);
    setCategory('');
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">Calculate your Body Mass Index (BMI) to evaluate if your weight is in the healthy range proportion to your height.</p>

      {/* Unit Toggle */}
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 rounded-l-lg border ${unit === 'metric' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
          onClick={() => setUnit('metric')}
        >
          Metric (cm/kg)
        </button>
        <button
          className={`px-4 py-2 rounded-r-lg border ${unit === 'imperial' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
          onClick={() => setUnit('imperial')}
        >
          Imperial (in/lbs)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {unit === 'metric' ? 'Height (cm)' : 'Height (inches)'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder={unit === 'metric' ? 'e.g., 175' : 'e.g., 69'}
            />
            <Scale className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
            />
            <Scale className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <button
          onClick={calculateBMI}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          disabled={!height || !weight}
        >
          Calculate BMI
        </button>

        <button
          onClick={resetCalculator}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Reset
        </button>
      </div>

      {bmi && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Your BMI is</p>
            <p className={`text-4xl font-bold ${getBmiColor()}`}>{bmi}</p>
            <p className={`text-xl ${getBmiColor()}`}>{category}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-2">What does this mean?</h4>
            <p className="text-gray-600 text-sm mb-2">BMI Categories:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center"><span className="w-3 h-3 bg-blue-500 inline-block mr-2 rounded-full"></span> Underweight: BMI less than 18.5</li>
              <li className="flex items-center"><span className="w-3 h-3 bg-green-500 inline-block mr-2 rounded-full"></span> Normal weight: BMI 18.5-24.9</li>
              <li className="flex items-center"><span className="w-3 h-3 bg-yellow-500 inline-block mr-2 rounded-full"></span> Overweight: BMI 25-29.9</li>
              <li className="flex items-center"><span className="w-3 h-3 bg-red-500 inline-block mr-2 rounded-full"></span> Obesity: BMI 30 or higher</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">Note: BMI is a screening tool but does not diagnose body fatness or health. Consult with a healthcare provider for a health assessment.</p>
          </div>
        </div>
      )}
    </div>
  );
};


const HeartRiskAssessment = () => {
  const [age, setAge] = useState('');
  const [systolicBp, setSystolicBp] = useState('');
  const [totalCholesterol, setTotalCholesterol] = useState('');
  const [smoking, setSmoking] = useState('');
  const [diabetes, setDiabetes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateRisk = async () => {
    if (!age || !systolicBp || !totalCholesterol || !smoking || !diabetes) {
      setError('Please fill out all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('age', parseFloat(age));
    formData.append('systolic_bp', parseFloat(systolicBp));
    formData.append('total_cholesterol', parseFloat(totalCholesterol));
    formData.append('smoking', parseFloat(smoking));
    formData.append('diabetes', parseFloat(diabetes));

    try {
      const response = await axios.post('http://localhost:5000/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPrediction(response.data);
      setSubmitted(true);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred while calculating risk. Please try again.';
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssessment = () => {
    setAge('');
    setSystolicBp('');
    setTotalCholesterol('');
    setSmoking('');
    setDiabetes('');
    setSubmitted(false);
    setPrediction(null);
    setError(null);
  };

  const renderResultsOrForm = () => {
    if (submitted && prediction) {
      const riskColor = prediction.prediction === 'No Heart Attack' ? 'text-green-500' : 'text-red-500';

      return (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Your heart attack risk prediction is</p>
            <p className={`text-3xl font-bold ${riskColor}`}>{prediction.prediction}</p>
            <p className="text-gray-600 mt-2">Confidence: {prediction.confidence}</p>
            <p className="text-gray-600">Risk Factors: {prediction.risk_factors_count}</p>
            <p className="text-gray-600">
              Probability of No Heart Attack: {prediction.probabilities.no_heart_attack}<br />
              Probability of Heart Attack: {prediction.probabilities.heart_attack}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="font-semibold mb-2">What does this mean?</h4>
            <p className="text-gray-600 text-sm">
              This prediction is based on a machine learning model and should be used for informational purposes only.
              Consult a healthcare provider for a comprehensive assessment.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Recommendations:</h4>
            <div className="flex items-start">
              <Heart className="text-red-500 mr-2 mt-1 flex-shrink-0" size={18} />
              <p className="text-gray-600 text-sm">Schedule a check-up with your healthcare provider to discuss your heart health.</p>
            </div>
            <div className="flex items-start">
              <Activity className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={18} />
              <p className="text-gray-600 text-sm">Aim for at least 150 minutes of moderate physical activity each week.</p>
            </div>
            <div className="flex items-start">
              <BookOpen className="text-green-500 mr-2 mt-1 flex-shrink-0" size={18} />
              <p className="text-gray-600 text-sm">Learn about heart-healthy eating habits and maintain a balanced diet.</p>
            </div>
          </div>

          <button
            onClick={resetAssessment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors mt-6"
          >
            Start New Assessment
          </button>
        </div>
      );
    }

    return (
      <div>
        <p className="text-gray-600 mb-6">Answer the following questions to get a heart attack risk prediction based on our machine learning model.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g., 45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Systolic Blood Pressure (mmHg)</label>
            <input
              type="number"
              value={systolicBp}
              onChange={(e) => setSystolicBp(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g., 120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Cholesterol (mg/dL)</label>
            <input
              type="number"
              value={totalCholesterol}
              onChange={(e) => setTotalCholesterol(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g., 200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do you smoke? (1 for Yes, 0 for No)</label>
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${smoking === '1' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                onClick={() => setSmoking('1')}
              >
                Yes
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${smoking === '0' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                onClick={() => setSmoking('0')}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do you have diabetes? (1 for Yes, 0 for No)</label>
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${diabetes === '1' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                onClick={() => setDiabetes('1')}
              >
                Yes
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${diabetes === '0' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                onClick={() => setDiabetes('0')}
              >
                No
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={calculateRisk}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            disabled={isLoading || !age || !systolicBp || !totalCholesterol || !smoking || !diabetes}
          >
            {isLoading ? 'Calculating...' : 'Calculate Risk'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">This tool uses a machine learning model to predict your risk of heart attack based on key risk factors.</p>
      {renderResultsOrForm()}
    </div>
  );
};


// Medical Dictionary Component
const MedicalDictionary = () => {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:9000/api/medical-terms')
      .then(res => setTerms(res.data))
      .catch(() => setTerms([]));
  }, []);

  useEffect(() => {
    setFiltered(
      terms.filter(
        t =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t.definition.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, terms]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search medical terms..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 mb-4 border rounded"
      />
      {selected ? (
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-2xl font-bold mb-2">{selected.term}</h2>
          <div className="mb-2 text-sm text-blue-700">{selected.category}</div>
          <p className="mb-4">{selected.definition}</p>
          {selected.relatedTerms?.length > 0 && (
            <div className="mb-4">
              <span className="font-semibold">Related Terms: </span>
              {selected.relatedTerms.map((rt, i) => (
                <span key={i} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mr-2">{rt}</span>
              ))}
            </div>
          )}
          <button
            className="text-blue-600 underline"
            onClick={() => setSelected(null)}
          >
            Back to list
          </button>
        </div>
      ) : (
        <div>
          {filtered.length === 0 ? (
            <div className="text-gray-500">No terms found.</div>
          ) : (
            <ul>
              {filtered.map(term => (
                <li
                  key={term._id}
                  className="p-3 border-b cursor-pointer hover:bg-blue-50"
                  onClick={() => setSelected(term)}
                >
                  <span className="font-semibold">{term.term}</span>
                  <span className="ml-2 text-xs text-gray-500">{term.category}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Find;