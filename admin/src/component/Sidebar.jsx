import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { FaUserMd, FaCalendarAlt, FaPills, FaChartLine, FaCog, FaClipboardList, FaUserInjured, FaFileInvoiceDollar, FaBook, FaAngleLeft, FaAngleRight, FaInfoCircle, FaTruck, FaMoneyBillWave } from 'react-icons/fa'

const Sidebar = () => {
    const [expanded, setExpanded] = useState(true);
    const location = useLocation();

    const toggleSidebar = () => {
        setExpanded(!expanded);
    };

    const menuItems = [
        { title: 'Dashboard', icon: <FaChartLine />, path: '/admin/dashboard' },
        { title: 'Doctors', icon: <FaUserMd />, path: '/admin/doctors' },
        { title: 'Add Doctor', icon: <FaUserMd />, path: '/admin/add-doctor' },
        { title: 'Patients', icon: <FaUserInjured />, path: '/admin/patients' },
        { title: 'Add Medicine', icon: <FaPills />, path: '/admin/add-medicine' },
        { title: 'Suppliers', icon: <FaTruck />, path: '/admin/suppliers' },
        { title: 'Hospital Pricing', icon: <FaMoneyBillWave />, path: '/admin/hospital-pricing' },
        { title: 'Billing', icon: <FaFileInvoiceDollar />, path: '/admin/billing' },
        { title: 'Settings', icon: <FaCog />, path: '/admin/settings' },
    ];

    return (
        <div className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-in-out 
            ${expanded ? 'w-64' : 'w-20'} 
            bg-gradient-to-b from-blue-800 to-blue-600 text-white shadow-xl`}
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-[76px] bg-blue-600 p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                style={{ transform: 'translateY(-50%)' }}
            >
                {expanded ? <FaAngleLeft size={16} /> : <FaAngleRight size={16} />}
            </button>

            {/* Logo */}
            <div className={`p-4 flex items-center ${expanded ? 'justify-start' : 'justify-center'}`}>
                <img src={assets.carelink} alt="Logo" className="h-8 w-auto" />
            </div>

            {/* Navigation Menu */}
            <nav className="mt-8 px-4">
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
                        <span className={`whitespace-nowrap font-medium transition-all duration-300
                            ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}`}>
                            {item.title}
                        </span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default Sidebar; 