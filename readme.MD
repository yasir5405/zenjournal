# ZenJournal 🧘

**A Mental Health Journaling + AI Reflection Web Application**

ZenJournal is a secure, full-stack web application designed to help users log their daily thoughts, experiences, and mental health journey. The application features a modern React frontend with TypeScript and a robust Node.js backend with MongoDB for data persistence.

## 🎯 Project Overview

ZenJournal provides a safe space for users to document their mental health journey through secure journaling. Users can create, read, update, and delete journal entries while maintaining complete privacy and security. The application is designed with future AI-powered reflection and insight features in mind.

## ✨ Features

### Current Features ✅
- **User Authentication**
  - Secure user signup and login system
  - JWT-based authentication with HTTP-only cookies
  - Password hashing with bcrypt (10 rounds)
  - Protected routes for authenticated users only

- **Journal Management**
  - Create new journal entries with title and content
  - View all journal entries in a paginated grid layout
  - Update existing journal entries
  - Delete unwanted journal entries
  - Search functionality across titles and content
  - Sorting options (newest, oldest, alphabetical)
  - Character and word count tracking
  - Unsaved changes protection

- **Analytics Dashboard**
  - Real-time mood distribution analysis
  - Current and longest streak tracking
  - Mood trends visualization (7/30/90 day periods)
  - Weekly activity calendar heatmap
  - Interactive charts using Recharts library
  - Dominant mood detection with visual indicators

- **Mood Calendar**
  - Interactive calendar view with mood visualization
  - Color-coded mood indicators per day
  - AI-powered mood insights using Google Gemini
  - Mood statistics and trends analysis
  - 8 mood categories: happy, sad, grateful, angry, anxious, calm, energetic, tired
  - Monthly mood tracking with navigation
  - Multiple entries per day support
  - Automatic mood detection from journal content

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Beautiful component library with Radix UI
  - Persistent sidebar navigation with collapsible sections
  - Modal-based entry creation and editing
  - Toast notifications for user feedback
  - Loading skeletons for better UX
  - Dark mode support with theme toggle

- **Security & Privacy**
  - JWT tokens stored in HTTP-only cookies
  - Password validation and hashing
  - Protected API endpoints
  - User data isolation (users only see their own entries)

### Planned Features 🚧
- Tags and categories for entries
- Export journal entries (PDF/Text)
- Password reset via email
- Goals and progress tracking
- Advanced AI insights and recommendations

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Redux Toolkit** - State management
- **Redux Persist** - Persist Redux state
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Recharts** - Chart and data visualization library
- **date-fns** - Modern date utility library
- **Motion** - Animation library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **Vercel AI SDK** - AI integration framework
- **Google Gemini API** - AI-powered insights generation

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart server
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📁 Project Structure

```
backend-project/
├── backend/                    # Node.js/Express backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js  # Authentication logic
│   │   ├── journal.controller.js # Journal CRUD operations
│   │   ├── analytics.controller.js # Analytics and mood trends
│   │   └── mood.controller.js  # Mood tracking and AI insights
│   ├── middlewares/
│   │   ├── auth.middleware.js  # JWT verification
│   │   └── error.middleware.js # Global error handling
│   ├── models/
│   │   ├── user.model.js      # User schema
│   │   └── journal.model.js   # Journal entry schema
│   ├── routes/
│   │   ├── auth.route.js      # Authentication routes
│   │   ├── journal.route.js   # Journal routes
│   │   └── mood.route.js      # Mood tracking routes
│   ├── utils/
│   │   └── validation.js      # Zod validation schemas
│   ├── docs/
│   │   ├── SRS.md            # Software Requirements Specification
│   │   └── FR.md             # Functional Requirements
│   ├── package.json
│   └── index.js              # Server entry point
│
├── frontend/                  # React/TypeScript frontend
│   ├── src/
│   │   ├── api/              # API integration
│   │   ├── components/       # Reusable UI components
│   │   │   └── ui/           # Shadcn/ui components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Application pages
│   │   │   ├── Dashboard.tsx    # Main dashboard
│   │   │   ├── Analytics.tsx    # Analytics dashboard
│   │   │   ├── MoodCalendar.tsx # Mood calendar view
│   │   │   ├── Entries.tsx      # All entries page
│   │   │   └── CreateEntry.tsx  # Entry creation
│   │   ├── store/           # Redux store configuration
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Application entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.ts       # Vite configuration
│
└── readme.MD                 # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yasir5405/zenjournal.git
   cd backend-project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/zenjournal
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
   ```
   
   > **Note:** Get your free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

5. **Start the Applications**
   
   **Backend** (in `/backend` directory):
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```
   
   **Frontend** (in `/frontend` directory):
   ```bash
   npm run dev  # Development server
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securePassword123"
}
```

#### POST `/auth/login`
Authenticate user and receive JWT token
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### POST `/auth/logout`
Logout user and clear authentication cookies

#### GET `/auth/me`
Get current user information (requires authentication)

### Journal Endpoints

#### GET `/journal`
Get paginated journal entries for authenticated user
- Query parameters: `page`, `limit`, `search`, `sort`

#### POST `/journal`
Create a new journal entry
```json
{
  "title": "My Daily Reflection",
  "content": "Today was a productive day..."
}
```

#### GET `/journal/:id`
Get a specific journal entry by ID

#### PUT `/journal/:id`
Update an existing journal entry
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### DELETE `/journal/:id`
Delete a journal entry

### Analytics Endpoints

#### GET `/journal/analytics/overview`
Get analytics overview including mood distribution and streaks

#### GET `/journal/analytics/trends`
Get mood trends over time
- Query parameters: `period` (7, 30, or 90 days)

#### GET `/journal/analytics/activity`
Get activity calendar data for the current month

### Mood Tracking Endpoints

#### GET `/mood/calendar`
Get mood calendar data for a specific month
- Query parameters: `month`, `year`

#### GET `/mood/insights`
Get AI-powered mood insights based on the last 30 days of entries

#### GET `/mood/stats`
Get mood statistics and distribution
- Query parameters: `days` (default: 30)

#### POST `/mood/log`
Log a quick mood entry without a full journal
```json
{
  "mood": "happy",
  "note": "Feeling great today!"
}
```

## 🔒 Security Features

- **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **Input Validation**: All inputs validated using Zod schemas
- **CORS Protection**: Configured for specific origins
- **Error Handling**: Centralized error handling without exposing sensitive data
- **Route Protection**: Authentication middleware protects sensitive endpoints

## 👥 Team

- **Yasir Naseem** - Full-stack Developer
- **Ayush Singh** - Developer  
- **Dhrupad Kapoor** - Developer
- **Arvin** - Developer

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need support, please open an issue on GitHub.

---

**Built with ❤️ for mental health and wellbeing**