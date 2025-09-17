// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import TransactionChart from '../components/TransactionChart';

const SortableHeader = ({ children, columnKey, sortConfig, setSortConfig }) => {
    const isSorted = sortConfig.key === columnKey;
    const isAsc = isSorted && sortConfig.direction === 'asc';
    const handleClick = () => setSortConfig({ key: columnKey, direction: isAsc ? 'desc' : 'asc' });

    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-gray-500 dark:text-gray-300" onClick={handleClick}>
            <div className="flex items-center">{children}{isSorted && (isAsc ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />)}</div>
        </th>
    );
};

const DashboardPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]); // New state for all transactions
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [sortConfig, setSortConfig] = useState({
        key: searchParams.get('sort') || 'createdAt',
        direction: searchParams.get('order') || 'desc'
    });
    const [filters, setFilters] = useState({ status: searchParams.get('status') || '', schoolId: searchParams.get('schoolId') || '' });
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

    useEffect(() => {
        const fetchPaginatedTransactions = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams({ page: currentPage, limit: 10, sort: sortConfig.key, order: sortConfig.direction });
                if (filters.status) params.set('status', filters.status);
                if (filters.schoolId) params.set('schoolId', filters.schoolId.trim());

                const response = await api.get('/transactions', { params });
                setTransactions(response.data.transactions);
                setTotalPages(response.data.totalPages);
            } catch {
                setError('Failed to fetch transactions.');
            } finally {
                setLoading(false);
            }
        };

        fetchPaginatedTransactions();
    }, [currentPage, sortConfig, filters]);

    useEffect(() => {
        const fetchAllTransactionsForChart = async () => {
            try {
                const response = await api.get('/transactions', { params: { limit: 1000 } });
                setAllTransactions(response.data.transactions);
            } catch (err) {
                console.error('Failed to fetch all transactions for chart:', err);
            }
        };

        fetchAllTransactionsForChart();
    }, []); // This useEffect will only run once on component mount


    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ status: '', schoolId: '' });
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            </div>

            <TransactionChart data={allTransactions} />

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="schoolId" placeholder="Filter by School ID" value={filters.schoolId} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                    <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-md">Clear Filters</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <SortableHeader columnKey="name" sortConfig={sortConfig} setSortConfig={setSortConfig}>Custom Order ID</SortableHeader>
                                <SortableHeader columnKey="custom_order_id" sortConfig={sortConfig} setSortConfig={setSortConfig}>Order ID</SortableHeader>
                                <SortableHeader columnKey="school_id" sortConfig={sortConfig} setSortConfig={setSortConfig}>School ID</SortableHeader>
                                <SortableHeader columnKey="status" sortConfig={sortConfig} setSortConfig={setSortConfig}>Status</SortableHeader>
                                <SortableHeader columnKey="order_amount" sortConfig={sortConfig} setSortConfig={setSortConfig}>Amount</SortableHeader>
                                <SortableHeader columnKey="payment_time" sortConfig={sortConfig} setSortConfig={setSortConfig}>Date</SortableHeader>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-10 dark:text-white">Loading...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="text-center py-10 text-red-500">{error}</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-10 dark:text-white">No transactions found.</td></tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.collect_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap dark:text-white">{tx.custom_order_id}</td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap dark:text-white">{tx.collect_id}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap dark:text-gray-300">{tx.school_id}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap dark:text-gray-300">₹{tx.order_amount?.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap dark:text-gray-300">{tx.payment_time ? new Date(tx.payment_time).toLocaleString() : 'N/A'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 dark:text-white">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-md disabled:opacity-50 dark:border-gray-600 dark:text-white">Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-md disabled:opacity-50 dark:border-gray-600 dark:text-white">Next</button>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;