import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
                    Edviron Dash
                </div>
                <nav className="flex-grow px-4 py-6">
                    <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Transactions
                    </Link>
                </nav>
                 <div className="px-4 py-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 truncate" title={user?.email}>{user?.email}</div>
                    <button onClick={handleLogout} className="w-full flex items-center mt-2 px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200">
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200" />
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
