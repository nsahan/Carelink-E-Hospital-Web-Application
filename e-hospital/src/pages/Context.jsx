import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ChevronRight, Send, User, MessageSquare } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    message: '',
    isSuccess: false,
    isSubmitting: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ message: '', isSuccess: false, isSubmitting: true });

    const formPayload = {
      access_key: '4be7e68c-9fd3-466d-a4ba-c2dc98883c8f',
      ...formData
    };

    try {
      const response = await axios.post('https://api.web3forms.com/submit', formPayload);
      if (response.data.success) {
        setFormStatus({
          message: 'Thank you for your message. Our team will contact you shortly.',
          isSuccess: true,
          isSubmitting: false
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setFormStatus({
          message: 'Something went wrong. Please try again later.',
          isSuccess: false,
          isSubmitting: false
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setFormStatus({
        message: 'Error sending message. Please try again.',
        isSuccess: false,
        isSubmitting: false
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            <span className="relative inline-block">
              <span className="relative z-10">Get in Touch</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-100 z-0"></span>
            </span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Our dedicated healthcare professionals are available around the clock to provide exceptional care and support.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
            <div className="bg-blue-600 py-6 px-8">
              <h3 className="text-2xl font-bold text-white">Contact Information</h3>
              <p className="text-blue-100 mt-2">Reach out to us anytime</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Emergency Hotline</h4>
                  <p className="text-blue-600 mt-1 font-medium">+94 769034458</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-blue-600 mt-1">carelink@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Working Hours</h4>
                  <p className="text-gray-600 mt-1">24/7 for Emergencies</p>
                  <p className="text-gray-600">Mon-Fri: 8am - 8pm</p>
                  <p className="text-gray-600">(General Inquiries)</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Location</h4>
                  <p className="text-gray-600 mt-1">Kurunegala , </p>
                  <p className="text-gray-600">Sri Lanka</p>
                </div>
              </div>
              
            
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
                        placeholder="Your Name"
                      />
                      <User className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
                        placeholder="Your email"
                      />
                      <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
                        placeholder="+94 7********"
                      />
                      <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select 
                      id="subject" 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange} 
                      required 
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    >
                      <option value="">Select a subject</option>
                      <option value="appointment">Schedule an Appointment</option>
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="billing">Billing & Insurance</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <div className="relative">
                      <textarea 
                        id="message" 
                        name="message" 
                        rows="5" 
                        value={formData.message} 
                        onChange={handleChange} 
                        required 
                        className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        placeholder="How can we help you today?"
                      ></textarea>
                      <MessageSquare className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    disabled={formStatus.isSubmitting}
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg shadow-sm py-4 px-6 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
                  >
                    {formStatus.isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </form>
              
              {formStatus.message && (
                <div className={`mt-6 p-4 rounded-lg ${formStatus.isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {formStatus.message}
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  By submitting this form, you agree to our <a href="#privacy" className="text-blue-600 hover:underline">Privacy Policy</a> and consent to being contacted regarding your inquiry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;