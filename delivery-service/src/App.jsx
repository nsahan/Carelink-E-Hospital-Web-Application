import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [deliveryPersonnel, setDeliveryPersonnel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if delivery personnel is logged in
        const token = localStorage.getItem('deliveryToken');
        const personnelData = localStorage.getItem('deliveryPersonnel');

        if (token && personnelData) {
            setIsAuthenticated(true);
            setDeliveryPersonnel(JSON.parse(personnelData));
        }

        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 text-center mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ?
                                <Navigate to="/dashboard" replace /> :
                                <Login
                                    setIsAuthenticated={setIsAuthenticated}
                                    setDeliveryPersonnel={setDeliveryPersonnel}
                                />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            isAuthenticated ?
                                <Dashboard
                                    deliveryPersonnel={deliveryPersonnel}
                                    setIsAuthenticated={setIsAuthenticated}
                                    setDeliveryPersonnel={setDeliveryPersonnel}
                                /> :
                                <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/"
                        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App; 