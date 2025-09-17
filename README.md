# School Payment Dashboard

This is a full-stack application that provides a dashboard for managing school payments. It includes a backend API built with Node.js, Express, and MongoDB, and a frontend client built with React, Vite, and Tailwind CSS.

Live Link :- https://school-payment-dashboard-j8fn.vercel.app/register

## Features

- **User Authentication**: Secure JWT-based authentication for user registration and login.
- **Transaction Management**: A comprehensive dashboard to view, filter, and sort transactions.
- **Payment Creation**: A simple interface to create new payment requests.
- **Real-time Status Check**: A dedicated page to check the status of a transaction.
- **Dark Mode**: A theme toggle to switch between light and dark modes.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/BadgujarKalpesh/school-payment-dashboard.git
    cd school-payment-dashboard
    ```

2.  **Install backend dependencies**:

    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies**:

    ```bash
    cd ../frontend
    npm install
    ```

### Environment Variables

You'll need to create a `.env` file in the `backend` directory with the following variables:

```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PAYMENT_API_KEY=<your_payment_api_key>
PG_SECRET_KEY=<your_pg_secret_key>
DEFAULT_SCHOOL_ID=<your_default_school_id>
```

You will also need to create a `.env` file in the `frontend` directory:

```
VITE_API_BASE_URL=http://localhost:5001/api
```

### Running the Application

1.  **Start the backend server**:

    ```bash
    cd backend
    npm start
    ```

2.  **Start the frontend client**:

    ```bash
    cd ../frontend
    npm run dev
    ```

---

## App Functionality

### Login and Registration

-   **Login Page**: A secure login page for existing users.
-   **Registration Page**: A simple registration page for new users.

<img width="1918" height="910" alt="Screenshot 2025-09-17 144926" src="https://github.com/user-attachments/assets/096e706f-0310-4d8d-b524-985043da3492" />

<img width="1897" height="893" alt="Screenshot 2025-09-17 144848" src="https://github.com/user-attachments/assets/1ecc677d-c816-4f77-b48e-17b76be527cb" />


### Dashboard

-   **Transactions Overview**: Displays a paginated list of all transactions with filtering and sorting options.
-   **Transaction Chart**: A bar chart that visualizes the status of all transactions.
-   
<img width="1885" height="900" alt="Screenshot 2025-09-17 144714" src="https://github.com/user-attachments/assets/39da2c87-1bf1-42a1-aec3-d44a7ddda2f7" />

<img width="1883" height="897" alt="Screenshot 2025-09-17 144748" src="https://github.com/user-attachments/assets/1e585eb1-3d8e-4cb2-83bb-5d9e1011b1e5" />


### Create Payment

-   **Payment Form**: A simple form to create new payment requests for students.

<img width="1905" height="899" alt="Screenshot 2025-09-17 144805" src="https://github.com/user-attachments/assets/d35bb3d0-dbe4-4584-8639-7de2010a5b96" />

### Check Status

-   **Status Checker**: A dedicated page to check the real-time status of a transaction using its custom order ID.


<img width="1911" height="897" alt="Screenshot 2025-09-17 144836" src="https://github.com/user-attachments/assets/1ff4c3b1-a66a-4b59-bf60-6ead72851c98" />


---

## Built With

-   [React](https://reactjs.org/)
-   [Vite](https://vitejs.dev/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Node.js](https://nodejs.org/)
-   [Express](https://expressjs.com/)
-   [MongoDB](https://www.mongodb.com/)
-   [Mongoose](https://mongoosejs.com/)
-   [JWT](https://jwt.io/)
