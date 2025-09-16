// frontend/src/pages/CheckStatusPage.jsx

import React from 'react';
import CheckStatusModal from '../components/CheckStatusModal';

const CheckStatusPage = () => {
    return (
        <div className="container mx-auto">
            <div className="max-w-lg mx-auto">
                <CheckStatusModal onClose={() => {}} />
            </div>
        </div>
    );
};

export default CheckStatusPage;