import React, { useState, useEffect } from 'react';
import { Heart, AlertCircle, Brain, Pill, Globe, Clock, Star, Award, Shield, Users } from 'lucide-react';
import axios from 'axios';

const About = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/about/content');
        if (response.data.success) {
          setContent(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-5 pattern-grid-lg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {content?.heroTitle || 'Revolutionizing Healthcare with CARELINK'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content?.heroSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-4">
                At Carelink, we envision a world where quality healthcare is accessible to everyone, regardless of location or circumstance. 
                We're breaking down barriers and bridging gaps by integrating cutting-edge technology with compassionate care.
              </p>
              <p className="text-lg text-gray-600">
                Founded in 2025, we've grown from a simple telemedicine platform to a comprehensive digital healthcare ecosystem that serves
                thousands of patients daily across the country.
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-blue-100 flex items-center justify-center">
                  <Heart size={120} className="text-blue-600" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={40} className="text-red-500" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <Brain size={40} className="text-green-500" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <Pill size={32} className="text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Comprehensive Services</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need for your health and wellness journey, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Emergency Service */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-red-200 flex items-center justify-center mb-4">
                <AlertCircle size={28} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Emergency Services</h3>
              <p className="text-gray-600">
                24/7 emergency consultations with rapid response teams available at your fingertips. 
                Virtual triage and ambulance dispatch within minutes.
              </p>
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-blue-200 flex items-center justify-center mb-4">
                <Brain size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Health Assistant</h3>
              <p className="text-gray-600">
                Powered by advanced AI, our digital assistant provides symptom assessment, 
                health monitoring, medication reminders, and personalized wellness advice.
              </p>
            </div>

            {/* E-Pharmacy */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-green-200 flex items-center justify-center mb-4">
                <Pill size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">E-Pharmacy</h3>
              <p className="text-gray-600">
                Order prescriptions with a few clicks and get medications delivered to your doorstep. 
                Automatic refills and medication tracking included.
              </p>
            </div>

            {/* Telemedicine */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-purple-200 flex items-center justify-center mb-4">
                <Globe size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Virtual Consultations</h3>
              <p className="text-gray-600">
                Connect with certified specialists from various medical fields through secure video calls. 
                Get expert opinions without leaving your home.
              </p>
            </div>

            {/* 24/7 Support */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-yellow-200 flex items-center justify-center mb-4">
                <Clock size={28} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Our dedicated support team is always available to assist you with any healthcare needs or 
                technical issues, any time of day or night.
              </p>
            </div>

            {/* Health Records */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-indigo-200 flex items-center justify-center mb-4">
                <Shield size={28} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Health Records</h3>
              <p className="text-gray-600">
                Securely store and access your medical history, test results, prescriptions, and appointments 
                in one centralized and encrypted platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Making a Difference</h2>
            <p className="mt-4 text-lg opacity-80">
              Our impact in numbers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">500K+</p>
              <p className="mt-2 opacity-80">Patients Served</p>
            </div>
            <div>
              <p className="text-4xl font-bold">3,000+</p>
              <p className="mt-2 opacity-80">Medical Professionals</p>
            </div>
            <div>
              <p className="text-4xl font-bold">98%</p>
              <p className="mt-2 opacity-80">Patient Satisfaction</p>
            </div>
            <div>
              <p className="text-4xl font-bold">24/7</p>
              <p className="mt-2 opacity-80">Around-the-clock Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
            <p className="mt-4 text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Users size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient-Centered</h3>
              <p className="text-gray-600">We put patients first in everything we do, designing our services around their needs and preferences.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Shield size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy & Security</h3>
              <p className="text-gray-600">We maintain the highest standards of data protection and patient confidentiality.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Star size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">We strive for excellence in every interaction, service, and technology we provide.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Award size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">We continuously evolve and improve our services through technological innovation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;