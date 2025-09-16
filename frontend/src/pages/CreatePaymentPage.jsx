// frontend/src/pages/CreatePaymentPage.jsx

import React from 'react';
import CreatePaymentModal from '../components/CreatePaymentModal';

const CreatePaymentPage = () => {
    // For a dedicated page, we render the modal content directly
    // or you can design a full-page form instead.
    return (
        <div className="container mx-auto">
             <div className="max-w-md mx-auto">
                <CreatePaymentModal onClose={() => {}} />
            </div>
        </div>
    );
};

export default CreatePaymentPage;