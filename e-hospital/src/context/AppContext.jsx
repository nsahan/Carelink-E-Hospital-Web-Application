import React, { createContext, useState, useEffect } from 'react';
import { doctors as initialDoctors } from '../assets/assets'; // Assuming doctors is an array

// Create a context for the app
export const AppContext = createContext();

// Named export for the context provider
export const AppContextProvider = ({ children }) => {
    const [doctors, setDoctors] = useState(initialDoctors); // Initialize state with doctors

    // Optional: If you want to fetch doctors from an API or perform any side effects
    useEffect(() => {
        // Simulate fetching data (you can replace this with an actual API call)
        const fetchDoctors = async () => {
            // Simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setDoctors(initialDoctors); // Set the fetched doctors
        };

        fetchDoctors();
    }, []);

    const value = {
        doctors, // Provide the doctors state
    };
    
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Default export for the context provider
export default AppContextProvider;