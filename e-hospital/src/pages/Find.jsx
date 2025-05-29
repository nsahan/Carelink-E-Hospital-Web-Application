import React, { useState } from 'react';
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
    },
    {
      id: 'find-facilities',
      name: 'Find Nearby Facilities',
      icon: <MapPin className="mr-3 text-purple-500" size={20} />,
      component: <NearbyFacilities />
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
    switch(activeTab) {
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
          <span className={`px-3 py-1 rounded-full text-sm ${
            result.severity === 'severe' ? 'bg-red-100 text-red-800' :
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Find Health Information</h1>
          <p className="text-xl mb-8">Discover reliable information about diseases and medical conditions</p>
          
          {renderSearchBox()}
          
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-4 text-sm">
              <span className="opacity-80">Recent searches: </span>
              {recentSearches.map((term, index) => (
                <span key={index} className="mx-1 cursor-pointer hover:underline">
                  {term}{index < recentSearches.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {renderSearchResults()}
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('diseases')}
            className={`px-4 py-2 mr-4 text-lg font-medium ${activeTab === 'diseases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Diseases & Conditions
          </button>
          <button 
            onClick={() => setActiveTab('treatments')}
            className={`px-4 py-2 mr-4 text-lg font-medium ${activeTab === 'treatments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Treatments
          </button>
          <button 
            onClick={() => setActiveTab('symptoms')}
            className={`px-4 py-2 mr-4 text-lg font-medium ${activeTab === 'symptoms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Symptoms Checker
          </button>
          <button 
            onClick={() => setActiveTab('specialists')}
            className={`px-4 py-2 text-lg font-medium ${activeTab === 'specialists' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Find Specialists
          </button>
        </div>
        
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <ul>
                {categories.map((category, index) => (
                  <li key={index} className="mb-3">
                    <button className="flex justify-between items-center w-full hover:text-blue-600 transition-colors">
                      <span>{category.name}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">{category.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button className="text-blue-600 flex items-center mt-2 text-sm font-medium hover:underline">
                View all categories <ChevronDown size={16} className="ml-1" />
              </button>
            </div>
            
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
                <button className="text-blue-600 text-sm font-medium">View All</button>
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
                      <span className="text-xs text-gray-500">{disease.articles} articles</span>
                      <button className="text-blue-600 flex items-center text-sm hover:underline">
                        Learn more <ArrowRight size={14} className="ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-3">
                    <Search size={24} />
                  </div>
                  <h3 className="font-medium mb-2">Explore More Health Topics</h3>
                  <p className="text-sm text-gray-500">Discover information on hundreds of diseases and conditions</p>
                </div>
              </div>
            </div>
            
            {/* AI Health Assistant */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white p-3 rounded-full mr-4">
                  <Activity size={24} />
                </div>
                <div className="w-full">
                  <h3 className="text-xl font-semibold mb-2">AI Health Assistant</h3>
                  <p className="text-gray-700 mb-4">Get personalized health information by describing your symptoms or asking questions in plain language.</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Describe your symptoms or ask a health question..."
                      className="w-full p-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1 rounded-full">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Note: This is for informational purposes only and not a substitute for professional medical advice.</p>
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

// Heart Disease Risk Assessment Component
const HeartRiskAssessment = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [hdl, setHdl] = useState('');
  const [systolic, setSystolic] = useState('');
  const [smoker, setSmoker] = useState('');
  const [diabetes, setDiabetes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  
  const calculateRisk = () => {
    // This is a simplified risk calculation for demonstration
    // Real heart disease risk calculators use more complex algorithms
    
    let score = 0;
    
    // Age factor
    if (age < 40) score += 0;
    else if (age < 50) score += 1;
    else if (age < 60) score += 2;
    else if (age < 70) score += 3;
    else score += 4;
    
    // Gender factor (simplified)
    if (gender === 'male') score += 1;
    
    // Cholesterol
    if (cholesterol > 240) score += 2;
    else if (cholesterol > 200) score += 1;
    
    // HDL (good cholesterol)
    if (hdl < 40) score += 1;
    else if (hdl > 60) score -= 1;
    
    // Blood pressure
    if (systolic > 160) score += 3;
    else if (systolic > 140) score += 2;
    else if (systolic > 120) score += 1;
    
    // Smoker
    if (smoker === 'yes') score += 2;
    
    // Diabetes
    if (diabetes === 'yes') score += 2;
    
    setRiskScore(score);
    setSubmitted(true);
  };
  
  const getRiskLevel = () => {
    if (riskScore <= 2) return { level: 'Low', color: 'text-green-500' };
    if (riskScore <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
    if (riskScore <= 8) return { level: 'High', color: 'text-orange-500' };
    return { level: 'Very High', color: 'text-red-500' };
  };
  
  const resetAssessment = () => {
    setAge('');
    setGender('');
    setCholesterol('');
    setHdl('');
    setSystolic('');
    setSmoker('');
    setDiabetes('');
    setSubmitted(false);
    setRiskScore(null);
  };
  
  const renderResultsOrForm = () => {
    if (submitted && riskScore !== null) {
      const risk = getRiskLevel();
      
      return (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Your heart disease risk level is</p>
            <p className={`text-3xl font-bold ${risk.color}`}>{risk.level}</p>
            <p className="text-gray-600 mt-2">Risk Score: {riskScore}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="font-semibold mb-2">What does this mean?</h4>
            <p className="text-gray-600 text-sm">This is a simplified risk assessment. Your actual risk may be different based on additional factors not included in this assessment.</p>
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
        <p className="text-gray-600 mb-6">Answer the following questions to get an estimated heart disease risk assessment.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter your age"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${gender === 'male' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => setGender('male')}
              >
                Male
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${gender === 'female' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => setGender('female')}
              >
                Female
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Cholesterol (mg/dL)</label>
            <input
              type="number"
              value={cholesterol}
              onChange={(e) => setCholesterol(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g., 200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HDL Cholesterol (mg/dL)</label>
            <input
              type="number"
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g., 50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Systolic Blood Pressure (mmHg)</label>
            <input
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g., 120"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do you smoke?</label>
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${smoker === 'yes' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => setSmoker('yes')}
              >
                Yes
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${smoker === 'no' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => setSmoker('no')}
              >
                No
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do you have diabetes?</label>
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${diabetes === 'yes' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => setDiabetes('yes')}
              >
                Yes
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg border ${diabetes === 'no' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => setDiabetes('no')}
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
            disabled={!age || !gender || !cholesterol || !hdl || !systolic || !smoker || !diabetes}
          >
            Calculate Risk
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <p className="text-gray-600 mb-6">This tool helps estimate your risk of developing heart disease based on several key risk factors.</p>
      {renderResultsOrForm()}
    </div>
  );
};

// Medical Dictionary Component
const MedicalDictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeEntry, setActiveEntry] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  // Sample dictionary entries
  const medicalTerms = [
    {
      term: 'Hypertension',
      definition: 'Blood pressure that is higher than normal. Also known as high blood pressure. Hypertension often has no symptoms but can lead to serious health problems like heart attack, stroke, and kidney disease if left untreated.',
      category: 'Cardiovascular',
      relatedTerms: ['Blood Pressure', 'Systolic', 'Diastolic']
    },
    {
      term: 'Diabetes Mellitus',
      definition: 'A group of metabolic disorders characterized by high blood sugar levels over a prolonged period. Symptoms include frequent urination, increased thirst, and increased hunger. If left untreated, diabetes can cause many health complications.',
      category: 'Endocrine',
      relatedTerms: ['Insulin', 'Glucose', 'Hemoglobin A1C']
    },
    {
      term: 'Myocardial Infarction',
      definition: 'Commonly known as a heart attack, it occurs when blood flow to a part of the heart is blocked, causing damage to the heart muscle. Symptoms often include chest pain, shortness of breath, nausea, and anxiety.',
      category: 'Cardiovascular',
      relatedTerms: ['Coronary Artery Disease', 'Atherosclerosis']
    },
    {
      term: 'Arthritis',
      definition: 'Inflammation of one or more joints, causing pain and stiffness that can worsen with age. The most common types are osteoarthritis and rheumatoid arthritis.',
      category: 'Musculoskeletal',
      relatedTerms: ['Inflammation', 'Joint Pain', 'Rheumatology']
    },
    {
      term: 'Anemia',
      definition: 'A condition in which you lack enough healthy red blood cells to carry adequate oxygen to your body\'s tissues. Having anemia can make you feel tired and weak.',
      category: 'Hematology',
      relatedTerms: ['Hemoglobin', 'Iron Deficiency', 'Red Blood Cells']
    }
  ];
  
  const searchDictionary = () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filteredResults = medicalTerms.filter(
        entry => entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setResults(filteredResults);
      setIsSearching(false);
    }, 300);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchDictionary();
    }
  };
  
  // Add this new component for detailed view
  const TermDetail = ({ term, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{term.term}</h2>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {term.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">Definition</h3>
          <p className="text-gray-600 leading-relaxed">{term.definition}</p>
        </div>
        
        {term.relatedTerms?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2">Related Terms</h3>
            <div className="flex flex-wrap gap-2">
              {term.relatedTerms.map((relatedTerm, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {relatedTerm}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <p className="text-gray-600 mb-6">Look up definitions of medical terms, conditions, and healthcare terminology.</p>
      
      <div className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search medical terms..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <button
          onClick={searchDictionary}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm"
        >
          Search
        </button>
      </div>
      
      {isSearching ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      ) : (
        <>
          {searchTerm && results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No results found for "{searchTerm}"</p>
              <p className="text-sm text-gray-500 mt-2">Try different keywords or browse common terms below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((entry, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border cursor-pointer hover:border-blue-300"
                  onClick={() => setSelectedTerm(entry)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{entry.term}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{entry.category}</span>
                  </div>
                  
                  {activeEntry === index && (
                    <div className="mt-3 pt-3 border-t border-gray-200 animate-fadeIn">
                      <p className="text-gray-700 mb-3">{entry.definition}</p>
                      {entry.relatedTerms.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Related Terms:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {entry.relatedTerms.map((term, i) => (
                              <span
                                key={i}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Browse common terms section */}
          {!searchTerm || results.length === 0 ? (
            <div className="mt-8">
              <h3 className="font-medium text-gray-700 mb-3">Browse Common Medical Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {medicalTerms.map((term, index) => (
                  <button 
                    key={index}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSearchTerm(term.term);
                      setResults([term]);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{term.term}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{term.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      {selectedTerm && (
        <TermDetail
          term={selectedTerm}
          onClose={() => setSelectedTerm(null)}
        />
      )}
    </div>
  );
};

// Nearby Facilities Component
const NearbyFacilities = () => {
  const [location, setLocation] = useState('Colombo, Sri Lanka');
  const [facilities, setFacilities] = useState([]);
  const [map, setMap] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10000); // 10 km

  const handleSearch = () => {
    if (!map) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        const service = new window.google.maps.places.PlacesService(map);
        const request = {
          location,
          radius: searchRadius,
          type: ['hospital', 'pharmacy'], // Search for both hospitals and pharmacies
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setFacilities(results);
            map.setCenter(location);
          }
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyD72Jk1ZU74ziWfQJ0iuJYb5bOBddbzNho" libraries={['places']}>
      <div className="p-4">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter a location"
          className="p-2 border rounded w-full mb-4"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          Search Facilities
        </button>

        <GoogleMap
          mapContainerStyle={{ height: '400px', width: '100%' }}
          center={{ lat: 6.9271, lng: 79.8612 }}
          zoom={12}
          onLoad={(map) => setMap(map)}
        >
          {facilities.map((facility, index) => (
            <Marker
              key={index}
              position={{
                lat: facility.geometry.location.lat(),
                lng: facility.geometry.location.lng(),
              }}
            />
          ))}
        </GoogleMap>

        <ul className="mt-4">
          {facilities.map((facility, index) => (
            <li key={index} className="border-b py-2">
              <strong>{facility.name}</strong> - {facility.vicinity}
            </li>
          ))}
        </ul>
      </div>
    </LoadScript>
  );
};

export default Find;

