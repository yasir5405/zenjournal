# ZenJournal

ZenJournal is a MERN stack project for mental health journaling.
(Current stage: User authentication system with signup, login, JWT, and validation).

# Features (current stage)

🔒 User Signup & Login

🛡️ JWT Authentication (stored in cookies)

🔑 Password Hashing with bcrypt

✅ Input validation with Zod

🌐 Express backend with error handling middleware

# Tech Stack

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js, MongoDB

Auth: JWT, bcrypt

Validation: Zod

# Project Structure (current stage)
backend/
├── controllers/     # signup, login
├── middlewares/     # errorHandler, verifyJWT
├── models/          # userModel.js
├── routes/          # auth routes
├── utils/           # validation.js (Zod schemas)
└── server.js

frontend/
└── (to be expanded later)

# Setup Instructions
1️⃣ Clone Repo
git clone https://github.com/yasir5405/zenjournal-backend.git
cd zenjournal-backend

2️⃣ Backend Setup
cd backend
npm install


Create a .env file (use .env.example as reference):

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret


Run backend:

npm run dev

3️⃣ Frontend Setup (basic React scaffold only for now)
cd ../frontend
npm install
npm start

# API Endpoints (so far)

POST /api/auth/signup → Register user

POST /api/auth/login → Login user

# Next Steps

Journal CRUD routes

Dashboard UI

AI reflections