// frontend/src/components/TransactionChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionChart = ({ data }) => {
    const chartData = [
        { name: 'Success', count: data.filter(tx => tx.status === 'SUCCESS').length },
        { name: 'Pending', count: data.filter(tx => tx.status === 'PENDING').length },
        { name: 'Failed', count: data.filter(tx => tx.status === 'FAILED').length },
    ];

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">Transaction Status Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TransactionChart;