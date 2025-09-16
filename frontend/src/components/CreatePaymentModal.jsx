import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

const CreatePaymentModal = ({ onClose }) => {
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
            console.log("hiiiiiiiiiiiiiiiiiiii")
            const response = await api.post('/payment/create-payment', {
                amount: parseFloat(amount),
                student_info: { name: studentName, email: studentEmail }
            });
            console.log("REsponse : ", response)
            window.location.href = response.data.paymentUrl;
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create payment link.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Create New Payment</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="number" placeholder="Amount (INR)" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full px-3 py-2 border rounded-md" min="1" step="any" />
                    <input type="text" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
                    <input type="email" placeholder="Student Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-2">
                         <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                         <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400">
                             {isSubmitting ? 'Processing...' : 'Proceed to Pay'}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePaymentModal;