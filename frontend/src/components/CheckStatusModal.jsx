// frontend/src/pages/CheckStatusPage.jsx

import React, { useState } from 'react';
import api from '../services/api';

const CheckStatusPage = () => {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCheck = async (e) => {
        e.preventDefault();
        if (!orderId) return;
        setIsLoading(true);
        setError('');
        setStatus(null);
        try {
            const response = await api.get(`/transaction-status/${orderId.trim()}`);
            setStatus(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not fetch transaction status.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">Check Transaction Status</h1>
                <form onSubmit={handleCheck} className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        placeholder="Enter Custom Order ID (e.g., ORD-123456789)" 
                        value={orderId} 
                        onChange={(e) => setOrderId(e.target.value)} 
                        className="flex-grow px-3 py-2 border rounded-md" 
                    />
                    <button type="submit" disabled={isLoading || !orderId} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400">
                        {isLoading ? 'Checking...' : 'Check'}
                    </button>
                </form>
                
                {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
                
                {status && (
                    <div className="mt-6 p-4 border rounded-md bg-gray-50">
                        <h3 className="font-bold text-lg mb-2">Transaction Details</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-600">Status:</p>
                            <p className="font-semibold">{status.status}</p>
                            
                            <p className="text-gray-600">Amount:</p>
                            <p>₹{status.order_amount?.toFixed(2)}</p>
                            
                            <p className="text-gray-600">Gateway Ref:</p>
                            <p>{status.bank_reference || 'N/A'}</p>
                            
                            <p className="text-gray-600">Payment Time:</p>
                            <p>{status.payment_time ? new Date(status.payment_time).toLocaleString() : 'N/A'}</p>
                            
                            <p className="text-gray-600 col-span-2">Message: {status.payment_message || 'N/A'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckStatusPage;