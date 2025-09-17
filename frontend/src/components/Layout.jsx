// frontend/src/components/Layout.jsx

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, CreditCard, HelpCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const linkClasses = "flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200";
    const activeLinkClasses = "bg-gray-900 text-white";

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                    Dashboard
                </div>
                <nav className="flex-grow px-4 py-6 space-y-2">
                    <NavLink to="/dashboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Transactions
                    </NavLink>
                    <NavLink to="/create-payment" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <CreditCard className="w-5 h-5 mr-3" />
                        Create Payment
                    </NavLink>
                    <NavLink to="/check-status" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <HelpCircle className="w-5 h-5 mr-3" />
                        Check Status
                    </NavLink>
                </nav>
                <div className="px-4 py-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 truncate" title={user?.email}>{user?.email}</div>

                    {/* Dark Mode Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center mt-2 px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center mt-2 px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" />
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;