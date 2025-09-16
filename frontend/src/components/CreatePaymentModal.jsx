// frontend/src/pages/CreatePaymentPage.jsx

import React, { useState } from 'react';
import api from '../services/api';

const CreatePaymentPage = () => {
    const [amount, setAmount] = useState('');
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const response = await api.post('/payment/create-payment', {
                amount: parseFloat(amount),
                student_info: { name: studentName, email: studentEmail }
            });
            // Redirect the user to the payment gateway
            window.location.href = response.data.paymentUrl;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create payment link.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">Create New Payment</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (INR)</label>
                        <input 
                            id="amount"
                            type="number" 
                            placeholder="Enter amount" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            required 
                            className="mt-1 w-full px-3 py-2 border rounded-md" 
                            min="1" 
                            step="any" 
                        />
                    </div>
                    <div>
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Student Name</label>
                        <input 
                            id="studentName"
                            type="text" 
                            placeholder="Enter student's name" 
                            value={studentName} 
                            onChange={(e) => setStudentName(e.target.value)} 
                            required 
                            className="mt-1 w-full px-3 py-2 border rounded-md" 
                        />
                    </div>
                    <div>
                        <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700">Student Email</label>
                        <input 
                            id="studentEmail"
                            type="email" 
                            placeholder="Enter student's email" 
                            value={studentEmail} 
                            onChange={(e) => setStudentEmail(e.target.value)} 
                            required 
                            className="mt-1 w-full px-3 py-2 border rounded-md" 
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <div className="pt-2">
                         <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400">
                             {isSubmitting ? 'Processing...' : 'Proceed to Pay'}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePaymentPage;