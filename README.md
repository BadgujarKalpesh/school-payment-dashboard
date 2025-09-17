# School Payment Dashboard

This is a full-stack application that provides a dashboard for managing school payments. It includes a backend API built with Node.js, Express, and MongoDB, and a frontend client built with React, Vite, and Tailwind CSS.

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
    git clone [https://github.com/badgujarkalpesh/school-payment-dashboard.git](https://github.com/badgujarkalpesh/school-payment-dashboard.git)
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


### Dashboard

-   **Transactions Overview**: Displays a paginated list of all transactions with filtering and sorting options.
-   **Transaction Chart**: A bar chart that visualizes the status of all transactions.


### Create Payment

-   **Payment Form**: A simple form to create new payment requests for students.


### Check Status

-   **Status Checker**: A dedicated page to check the real-time status of a transaction using its custom order ID.


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
