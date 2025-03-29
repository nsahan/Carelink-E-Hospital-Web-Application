import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { FaUserMd, FaCalendarAlt, FaPills, FaChartLine, FaCog, FaClipboardList, FaUserInjured, FaFileInvoiceDollar } from 'react-icons/fa'

const Sidebar = () => {
    const [sidebar, setSidebar] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebar(!sidebar);
    };

    const menuItems = [
        { title: 'Dashboard', icon: <FaChartLine />, path: '/admin/dashboard' },
        { title: 'Doctors', icon: <FaUserMd />, path: '/admin/doctors' },
        { title: 'Add Doctor', icon: <FaUserMd />, path: '/admin/add-doctor' },
        { title: 'Appointments', icon: <FaCalendarAlt />, path: '/admin/appointments' },
        { title: 'Patients', icon: <FaUserInjured />, path: '/admin/patients' },
        { title: 'Medicine Inventory', icon: <FaPills />, path: '/admin/medicines' },
        { title: 'Add Medicine', icon: <FaPills />, path: '/admin/add-medicine' },
        { title: 'Prescriptions', icon: <FaClipboardList />, path: '/admin/prescriptions' },
        { title: 'Billing', icon: <FaFileInvoiceDollar />, path: '/admin/billing' },
        { title: 'Settings', icon: <FaCog />, path: '/admin/settings' },
    ];

    return (
        <div className={`h-screen fixed left-0 top-0 z-40 ${sidebar ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-800 to-blue-600 text-white transition-all duration-300 ease-in-out shadow-xl`}>
            <button onClick={toggleSidebar} className="absolute -right-3 top-5 bg-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                {sidebar ? '←' : '→'}
            </button>
            
            <div className="p-4 mt-14">
                <nav className="space-y-2">
                    {menuItems.map((item, index) => (
                        <Link 
                            key={index} 
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors mb-1
                                ${location.pathname === item.path 
                                    ? 'bg-white/10 shadow-lg' 
                                    : 'hover:bg-white/5'}`}
                        >
                            <span className={`text-xl ${location.pathname === item.path ? 'text-white' : 'text-gray-300'}`}>
                                {item.icon}
                            </span>
                            <span className={`${sidebar ? 'block' : 'hidden'} whitespace-nowrap font-medium`}>
                                {item.title}
                            </span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}

export default Sidebar;

