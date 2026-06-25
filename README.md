# FinServe – AI Personal CFO & Wealth Analytics Dashboard

FinServe is a premium, production-ready personal finance management (PFM) and wealth analytics dashboard. Built with a dark fintech theme (Black & Neon Green) using the MERN stack, it leverages the **Groq Llama-3.3-70b-versatile** model to serve as an interactive AI Chief Financial Officer (CFO). It features linear regression budget forecasting, savings forecasts, affordability evaluations, bank CSV parsing, and automated PDFKit report downloads.

---

## Technical Stack

- **Frontend**: React.js, Vite, Tailwind CSS v3, React Router DOM, Axios, Recharts, Framer Motion, Lucide Icons, Context API.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM), JSON Web Tokens (JWT), bcryptjs, Helmet, CORS, Express Rate Limiter, Multer, PDFKit.
- **AI Engine**: Groq API Console (`llama-3.3-70b-versatile`).

---

## Directory Structure

```text
FinServe/
├── backend/
│   ├── config/          # MongoDB connectivity config
│   ├── middleware/      # JWT route protection middleware
│   ├── models/          # Mongoose database models (User, Income, Expense, Goal, etc.)
│   ├── routes/          # API endpoint routes (Auth, Upload, Chat, PDF, Forecast, etc.)
│   ├── server.js        # Core Express app setup, rate-limiting & env checks
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Shared dashboard & visual components (ScoreMeter, ProgressRing, Sidebar)
    │   ├── context/     # React AuthContext (Session management & auto toast alerts)
    │   ├── pages/       # Dashboard, Expenses, Income, Analytics, Settings views
    │   ├── utils/       # Global Axios instance interceptor
    │   ├── App.jsx      # Navigation router guards
    │   ├── index.css    # Custom dark fintech styling
    │   └── main.jsx
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Setup & Installation

### Prerequisite Checklist
- [Node.js](https://nodejs.org/) (v16+ recommended)
- MongoDB Database (Local instance or MongoDB Atlas cluster URI)
- [Groq API Key](https://console.groq.com/) (Free tier available)

---

### Step 1: Environment Configuration

Create a `.env` file in the `backend/` folder. You can reference `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/finserve?retryWrites=true&w=majority
JWT_SECRET=use_a_strong_random_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_your_groq_api_key_goes_here
```

> [!WARNING]
> FinServe implements crash-safety checks at startup. If any required environment variable is missing, the server will log a descriptive error and immediately terminate.

---

### Step 2: Database Initialization

1. **MongoDB Atlas (Recommended)**: Create a free shared cluster, add a database user, whitelist your network IP, and copy the connection string.
2. **Local MongoDB**: Run `mongod` on your system. The URI is typically `mongodb://127.0.0.1:27017/finserve`.

---

### Step 3: Run the Backend Services

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on port 5000 by default):
   ```bash
   npm start
   ```

---

### Step 4: Run the Frontend Application

1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Access the web dashboard in your browser at `http://localhost:5173`.

---

## Key Core Features

### 1. Advanced Session Security
Protected routes automatically check JWT signatures. Unauthorized hits redirect to `/login`. Token expiration timers schedule automatic logouts to prevent sesson hijacking.

### 2. Linear Regression Budget Predictor
The `/api/predict-budget` endpoint fits a line of best fit to historical month-by-month spending data and matches it against a 3-month moving average to predict next month's spending and risk level.

### 3. CSV Importer
Drag and drop bank statements formatted as `Date,Description,Amount`. The backend parses rows and categorizes entries using custom keyword regex patterns (e.g. Zomato -> Food, Netflix -> Entertainment).

### 4. Interactive CFO Advisor & Affordability Widget
Submit queries directly to the Llama-3.3 chatbot pre-seeded with your transaction statistics. Test major purchases in the Affordability widget to see recovery times and circular scoring.

### 5. Automated PDF Report Downloads
Downloads are compiled on-the-fly inside Node using PDFKit, producing corporate-style summaries, tables, and AI CFO advice directly matching the database state.

---

## Screenshots Placeholder

*Dashboard Overview*
![Dashboard Screenshot Placeholder](https://via.placeholder.com/1200x600/0F0F0F/00FF88?text=FinServe+Dashboard+Overview+Mockup)

*AI CFO Chat & Affordability Check*
![AI Chat Screenshot Placeholder](https://via.placeholder.com/1200x600/0F0F0F/00FF88?text=AI+CFO+Chat+Interface+Mockup)
